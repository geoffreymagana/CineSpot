
'use client';

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Movie } from '@/lib/types';
import { useMovies } from '@/lib/hooks/use-movies';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { spotlightRecommendations, SpotlightRecommendationsOutput as AIOutput } from '@/ai/flows/spotlight-recommendations';
import { getTopRatedMovies, getTrendingMovies, getUpcomingMovies, searchMovies, getRecommendationsForTitle, getTitleDetails as tmdbGetTitleDetails } from '@/lib/services/tmdb';
import { useToast } from '@/hooks/use-toast';

// The final shape of our data after fetching details
export interface PopulatedSpotlightOutput {
    topPicks: Movie[];
    carousels: {
        title: string;
        recommendations: Movie[];
    }[];
}

interface RecommendationContextType {
  recommendations: PopulatedSpotlightOutput | null;
  trendingMovies: Movie[];
  topRatedMovies: Movie[];
  upcomingMovies: Movie[];
  isLoading: boolean;
  refetch: () => void;
  removeRecommendation: (movieId: number) => void;
}

export const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

const RECOMMENDATIONS_CACHE_KEY = 'cinespot-recommendations-cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

async function fetchMovieDetails(title: string): Promise<Movie | null> {
    const searchResults = await searchMovies(title, 1);
    return searchResults.length > 0 ? searchResults[0] : null;
}

export function RecommendationProvider({ children }: { children: ReactNode }) {
  const { movies, isLoading: isLoadingMovies } = useMovies();
  const { userLibrary } = useUserMovieData();
  const { toast } = useToast();

  const [recommendations, setRecommendations] = useState<PopulatedSpotlightOutput | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const removeRecommendation = (movieId: number) => {
    if (!recommendations) return;

    const newRecs = {
      ...recommendations,
      topPicks: recommendations.topPicks.filter(m => m.id !== movieId),
      carousels: recommendations.carousels.map(c => ({
        ...c,
        recommendations: c.recommendations.filter(m => m.id !== movieId)
      }))
    };

    setRecommendations(newRecs);

    try {
        const cached = localStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            data.recommendations = newRecs;
            localStorage.setItem(RECOMMENDATIONS_CACHE_KEY, JSON.stringify(data));
        }
    } catch (e) {
        console.warn("Could not update recommendations cache after removal.", e);
    }
  }

  const fetchAndCacheData = useCallback(async () => {
    if (isLoadingMovies) return;
    setIsLoading(true);

    try {
      // 1. Fetch titles from AI
      const watchedMovies = movies.filter(m => m.watchStatus === 'Completed');
      const addedMovies = [...movies].sort((a, b) => (b.rewatchCount || 0) - (a.rewatchCount || 0)).slice(0, 5); // Heuristic for recently added
      const likedMovies = movies.filter(m => userLibrary[m.id]?.personalRating && userLibrary[m.id].personalRating! >= 8);

      const aiInput = {
          watchedTitles: watchedMovies.slice(0, 5).map(m => m.title).join(', ') || 'N/A',
          addedTitles: addedMovies.map(m => m.title).join(', ') || 'N/A',
          likedTitles: likedMovies.slice(0, 5).map(m => m.title).join(', ') || 'N/A',
          collectedTitles: movies.map(m => m.title),
      };

    // Call AI flow pipeline: OpenAI fallback -> Genkit -> Local TF-IDF
    // Also fetch TMDB lists in parallel for fallbacks and corpus
    const [trending, topRated, upcoming] = await Promise.all([
      getTrendingMovies(),
      getTopRatedMovies(),
      getUpcomingMovies(),
    ]);

    // Helper to call OpenAI fallback route
    async function callOpenAIFallback() {
      try {
        const resp = await fetch('/api/openai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiInput),
        });
        if (!resp.ok) return null;
        return (await resp.json()) as AIOutput;
      } catch (e) {
        console.debug('OpenAI fallback request failed', e);
        return null;
      }
    }

    // 1) Try OpenAI first
    let aiResult: AIOutput = { topPicks: [], carousels: [] } as any;
    let openaiResult = await callOpenAIFallback();
    if (openaiResult && (Array.isArray(openaiResult.topPicks) && openaiResult.topPicks.length > 0)) {
      aiResult = openaiResult as AIOutput;
      console.debug('Recommendations: got results from OpenAI fallback', { topPicks: aiResult.topPicks.length, carousels: (aiResult.carousels || []).length });
    } else {
      // Previously we used Genkit here. User requested Genkit be disabled from the pipeline
      // due to model availability and to prefer OpenAI -> TF-IDF only. Keep this branch
      // so that if OpenAI produced no results we will rely on TF-IDF expansion below.
      console.debug('Skipping Genkit flow by user request; proceeding to TF-IDF fallback if needed.');
    }

    // Build candidate pool: AI titles + trending + title-based recommendations
    const aiTitlesRaw: string[] = (aiResult && Array.isArray(aiResult.topPicks)) ? aiResult.topPicks : [];
    const aiCarouselRaw: string[] = (aiResult && Array.isArray(aiResult.carousels)) ? aiResult.carousels.flatMap((c: { recommendations?: string[] }) => Array.isArray(c.recommendations) ? c.recommendations : []) : [];

  // Library sets for exclusion (use both id and title for robustness)
  // Use `userLibrary` keys to identify IDs in the user's collection (more reliable than `movies` list)
  const libraryIds = new Set<number>(Object.keys(userLibrary).map(k => Number(k)));
  const libraryTitles = new Set<string>(movies.map(m => (m.title || '').toLowerCase()));

    // Filter AI titles and trending titles to exclude anything already in library
    const aiTitles = aiTitlesRaw.filter(t => !!t && !libraryTitles.has(t.toLowerCase()));
    const aiCarouselTitles = aiCarouselRaw.filter(t => !!t && !libraryTitles.has(t.toLowerCase()));

    // If neither OpenAI nor Genkit produced titles, use local TF-IDF expansion as a fallback.
    if ((aiResult.topPicks || []).length === 0 && (aiResult.carousels || []).flatMap((c: any) => c.recommendations || []).length === 0) {
      try {
        const corpus = Array.from(new Set([
          ...trending.map(t => t.title || ''),
          ...topRated.map(t => t.title || ''),
          ...upcoming.map(t => t.title || ''),
        ])).filter(Boolean) as string[];

        const seed = watchedMovies[0]?.title || likedMovies[0]?.title || 'popular movies';

        const resp = await fetch('/api/local/expand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ corpus, query: seed, topK: 12 }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const expanded: string[] = Array.isArray(data?.expanded) ? data.expanded : [];
          // Merge expanded titles into aiResult.topPicks so they flow through the same resolution path
          expanded.forEach(t => {
            if (t && !libraryTitles.has(t.toLowerCase())) aiResult.topPicks.push(t);
          });
        }
      } catch (e) {
        console.warn('TF-IDF expansion fallback failed', e);
      }
    }

    // Build initial candidate set of titles (strings) excluding library titles
    const candidateTitles = new Set<string>([...aiTitles, ...aiCarouselTitles, ...trending.slice(0, 20).map(t => t.title).filter(tt => !libraryTitles.has((tt || '').toLowerCase()))]);

    // Add title-based recommendations for user's top liked/rewatched movies (lightweight)
      const seeds = [...likedMovies.slice(0,3), ...addedMovies.slice(0,3)];
      const titleRecommendationsPromises = seeds.map(async (seed): Promise<import('@/lib/types').Movie[] | []> => {
        try {
          return await getRecommendationsForTitle(seed.id, seed.media_type || 'movie');
        } catch (e) {
          return [];
        }
      });
      const titleRecommendationsLists = await Promise.all(titleRecommendationsPromises);
      for (const list of titleRecommendationsLists) {
        if (!Array.isArray(list)) continue;
        list.slice(0,5).forEach((m: import('@/lib/types').Movie) => {
          const title = (m as any)?.title;
          if (m && title && !libraryTitles.has(title.toLowerCase())) candidateTitles.add(title);
        });
      }

      // Special carousels: Because you liked, Because you added, Finished Watching <TV show>
      const specialCarousels: { title: string; recommendations: Movie[] }[] = [];

      // Because you liked
      if (likedMovies.length > 0) {
        const likedSeed = likedMovies[0];
        try {
          const recs = await getRecommendationsForTitle(likedSeed.id, likedSeed.media_type || 'movie');
          const resolved = (await Promise.all(recs.slice(0,6).map((r: any) => tmdbGetTitleDetails(r.id, r.media_type)))).filter(Boolean) as Movie[];
          const filtered = resolved.filter(r => !libraryIds.has(r.id)).slice(0,5);
          if (filtered.length > 0) specialCarousels.push({ title: `Because you liked ${likedSeed.title}`, recommendations: filtered });
        } catch (e) {
          console.debug('Failed to build "Because you liked" carousel', e);
        }
      }

      // Because you added
      if (addedMovies.length > 0) {
        const addedSeed = addedMovies[0];
        try {
          const recs = await getRecommendationsForTitle(addedSeed.id, addedSeed.media_type || 'movie');
          const resolved = (await Promise.all(recs.slice(0,6).map((r: any) => tmdbGetTitleDetails(r.id, r.media_type)))).filter(Boolean) as Movie[];
          const filtered = resolved.filter(r => !libraryIds.has(r.id)).slice(0,5);
          if (filtered.length > 0) specialCarousels.push({ title: `Because you added ${addedSeed.title}`, recommendations: filtered });
        } catch (e) {
          console.debug('Failed to build "Because you added" carousel', e);
        }
      }

      // Finished Watching <TV show> (most recently completed TV show)
      const recentlyFinished = watchedMovies.find(m => m.media_type === 'tv');
      if (recentlyFinished) {
        try {
          const recs = await getRecommendationsForTitle(recentlyFinished.id, 'tv');
          const resolved = (await Promise.all(recs.slice(0,6).map((r: any) => tmdbGetTitleDetails(r.id, r.media_type)))).filter(Boolean) as Movie[];
          const filtered = resolved.filter(r => !libraryIds.has(r.id)).slice(0,5);
          if (filtered.length > 0) specialCarousels.push({ title: `Finished Watching: ${recentlyFinished.title}? Try these`, recommendations: filtered });
        } catch (e) {
          console.debug('Failed to build "Finished Watching" carousel', e);
        }
      }

      // 2. Fetch full data for AI-recommended titles (defensive: AI may return null/invalid data)
      const safeTopPicks = (aiResult && Array.isArray(aiResult.topPicks)) ? aiResult.topPicks : [];
      const safeCarousels = (aiResult && Array.isArray(aiResult.carousels)) ? aiResult.carousels : [];

      // Resolve candidate titles to Movie entries
  const candidateArray = Array.from(candidateTitles);
  const candidateDetails = await Promise.all(candidateArray.map(t => fetchMovieDetails(t)));

      // Scoring: small lightweight heuristic
      const scoreMap = new Map<number, number>();
      const movieById = new Map<number, Movie>();
      for (const m of candidateDetails) {
        if (!m) continue;
        if (libraryIds.has(m.id)) continue; // skip items already in library
        movieById.set(m.id, m);
        let score = 0;
        // base: popularity from TMDB via vote_average
        score += (m.vote_average || 0) * 2;
        // prefer not-in-library
        if (!userLibrary[m.id]) score += 5;
        // prefer liked genres: boost if user has many movies in same genre
        const userGenres = new Map<number, number>();
        for (const libMovieIdStr of Object.keys(userLibrary)) {
          const libMovie = userLibrary[Number(libMovieIdStr)];
          if (!libMovie || !('genres' in libMovie) || !Array.isArray((libMovie as any).genres)) continue;
          (libMovie as any).genres.forEach((g: { id: number }) => userGenres.set(g.id, (userGenres.get(g.id) || 0) + 1));
        }
        if (Array.isArray(m.genres)) {
          for (const g of m.genres) {
            score += (userGenres.get(g.id) || 0) * 1.5;
          }
        }
        
        // incorporate explicit thumbs feedback stored on the movie
        // if user gave a thumbs-up for this exact title previously, boost it strongly
        const stored = userLibrary[m.id];
        if (stored && stored.lastFeedback && stored.lastFeedback.liked === true) {
          score += 15; // strong positive signal for exact title
        }

        // If user gave thumbs-down for this exact title, penalize heavily
        if (stored && stored.lastFeedback && stored.lastFeedback.liked === false) {
          score -= 50; // avoid recommending this exact title
        }

        // If user has given thumbs-down feedback for other titles with overlapping genres,
        // treat that as a weak negative signal for these genres (learn a bit)
        for (const libMovieIdStr of Object.keys(userLibrary)) {
          const libMovie = userLibrary[Number(libMovieIdStr)];
          if (!libMovie || !libMovie.lastFeedback || libMovie.lastFeedback.liked !== false) continue;
          const badGenres = Array.isArray((libMovie as any).genres) ? (libMovie as any).genres.map((gg: any) => gg.id) : [];
          if (Array.isArray(m.genres) && m.genres.some(g => badGenres.includes(g.id))) {
            score -= 3; // slight penalty
          }
        }
        // rewatchability heuristic (if rewatchCount exists in userLibrary for similar titles)
        if (Object.values(userLibrary).some(ud => ((ud.rewatchCount || 0) > 1) && ud.genres && Array.isArray((ud as any).genres) && (ud as any).genres.some((gg: { id: number }) => m.genres?.some(mg => mg.id === gg.id)))) {
          score += 3;
        }
        // recently added/liked seeds should slightly boost similar titles
        if (aiTitles.includes(m.title) || aiCarouselTitles.includes(m.title)) score += 6;

        scoreMap.set(m.id, score);
      }

      // Sort candidates by score
      const scored = Array.from(scoreMap.entries()).sort((a,b) => b[1] - a[1]);

      const topPicksResolved: Movie[] = scored.slice(0, 6).map(([id]) => movieById.get(id)!).filter(Boolean);

      // Build carousels: keep Trending Now as its own carousel and avoid duplicates
      const trendingFiltered = trending.filter(m => !topPicksResolved.some(tp => tp.id === m.id) && !libraryIds.has(m.id)).slice(0,6);
      const carouselsDetails = [
        { title: 'Trending Now', recommendations: trendingFiltered },
      ];

      // Insert special carousels (Because you liked/added/Finished Watching) at the front
      if (specialCarousels.length) {
        carouselsDetails.unshift(...specialCarousels);
      }

      // Add personalized carousels: Because you watched/added/liked using AI carousels if available
      if (Array.isArray(safeCarousels) && safeCarousels.length > 0) {
        for (const c of safeCarousels) {
          const recs = (Array.isArray(c.recommendations) ? await Promise.all(c.recommendations.map((r: string) => fetchMovieDetails(r))) : []).filter(Boolean) as Movie[];
          const filtered = recs
            .filter(r => !topPicksResolved.some(tp => tp.id === r.id) && !trendingFiltered.some(t => t.id === r.id) && !libraryIds.has(r.id))
            .slice(0,5);
          if (filtered.length > 0) carouselsDetails.push({ title: c.title || 'Recommended', recommendations: filtered });
        }
      } else {
        // If AI carousels are not present, create deterministic carousels based on user's recent activity
  const watchedSeed = watchedMovies[0];
        if (watchedSeed) {
          const recs = (await getRecommendationsForTitle(watchedSeed.id, watchedSeed.media_type || 'movie')).slice(0,5) as import('@/lib/types').Movie[];
          const resolved = await Promise.all(recs.map(r => tmdbGetTitleDetails(r.id, r.media_type)));
          const filtered = (resolved.filter(Boolean) as Movie[]).filter(r => !libraryIds.has(r.id));
          if (filtered.length) carouselsDetails.push({ title: `Because you watched ${watchedSeed.title}`, recommendations: filtered.slice(0,5) });
        }
        const likedSeed = likedMovies[0];
        if (likedSeed) {
          const recs = (await getRecommendationsForTitle(likedSeed.id, likedSeed.media_type || 'movie')).slice(0,5) as import('@/lib/types').Movie[];
          const resolved = await Promise.all(recs.map(r => tmdbGetTitleDetails(r.id, r.media_type)));
          const filtered = (resolved.filter(Boolean) as Movie[]).filter(r => !libraryIds.has(r.id));
          if (filtered.length) carouselsDetails.push({ title: `Because you liked ${likedSeed.title}`, recommendations: filtered.slice(0,5) });
        }
        const addedSeed = addedMovies[0];
        if (addedSeed) {
          const recs = (await getRecommendationsForTitle(addedSeed.id, addedSeed.media_type || 'movie')).slice(0,5) as import('@/lib/types').Movie[];
          const resolved = await Promise.all(recs.map(r => tmdbGetTitleDetails(r.id, r.media_type)));
          const filtered = (resolved.filter(Boolean) as Movie[]).filter(r => !libraryIds.has(r.id));
          if (filtered.length) carouselsDetails.push({ title: `Since you added ${addedSeed.title}`, recommendations: filtered.slice(0,5) });
        }
      }

      const movieIdsInLibrary = new Set(movies.map(m => m.id));

    // Deduplicate carousels by title (avoid 'Trending Now' appearing twice)
    const seenTitles = new Set<string>();
    const dedupedCarousels = [] as { title: string; recommendations: Movie[] }[];
      for (const c of carouselsDetails) {
    const t = (c.title || '').trim();
    if (!t) continue;
    if (seenTitles.has(t.toLowerCase())) continue;
    seenTitles.add(t.toLowerCase());
      // Filter out library items and then try to refill if the carousel is empty
      let recs = (c.recommendations || []).filter(m => m && !movieIdsInLibrary.has(m.id)).slice(0,5) as Movie[];
      if (recs.length === 0) {
        // Refill from topRated or upcoming or trending
        const fallbackPool = [...topRated, ...upcoming, ...trending].filter(m => !movieIdsInLibrary.has(m.id));
        recs = fallbackPool.slice(0,5) as Movie[];
      }
      if (recs.length > 0) dedupedCarousels.push({ title: t, recommendations: recs });
    }

    const populatedRecs: PopulatedSpotlightOutput = {
      topPicks: topPicksResolved.filter(m => !movieIdsInLibrary.has(m.id)),
      carousels: dedupedCarousels,
    }

      setRecommendations(populatedRecs);
      setTrendingMovies(trending.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6));
      setTopRatedMovies(topRated.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6));
      setUpcomingMovies(upcoming.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6));

      // Cache the results
      localStorage.setItem(RECOMMENDATIONS_CACHE_KEY, JSON.stringify({
        recommendations: populatedRecs,
        trendingMovies: trending.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6),
        topRatedMovies: topRated.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6),
        upcomingMovies: upcoming.filter(m => !movieIdsInLibrary.has(m.id)).slice(0, 6),
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Could not fetch new recommendations',
        description: 'There was an issue connecting to our services. Loading from cache if available.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [movies, userLibrary, toast, isLoadingMovies]);

  useEffect(() => {
    let mounted = true;
    const loadDataOnce = async () => {
      try {
        const cachedData = localStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
        if (cachedData) {
          const { recommendations, trendingMovies, topRatedMovies, upcomingMovies, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            if (!mounted) return;
            setRecommendations(recommendations);
            setTrendingMovies(trendingMovies);
            setTopRatedMovies(topRatedMovies);
            setUpcomingMovies(upcomingMovies);
            setIsLoading(false);
            return; // Use cached data
          }
        }
      } catch (e) {
        console.error('Failed to load recommendations from cache', e);
      }
      // If no valid cache, fetch new data. We intentionally do NOT include fetchAndCacheData in the
      // dependency array because its identity can change often (movies/userLibrary refs) and cause
      // an update loop. Calling it here directly is safe because it reads the latest values.
      try {
        if (!mounted) return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        await fetchAndCacheData();
      } catch (e) {
        console.error('Error fetching recommendations', e);
      }
    };

    if (!isLoadingMovies) {
      loadDataOnce();
    }

    return () => { mounted = false };
  }, [isLoadingMovies]);

  return (
    <RecommendationContext.Provider value={{ recommendations, trendingMovies, topRatedMovies, upcomingMovies, isLoading, refetch: fetchAndCacheData, removeRecommendation }}>
      {children}
    </RecommendationContext.Provider>
  );
}
