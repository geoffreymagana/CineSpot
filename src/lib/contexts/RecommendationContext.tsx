
'use client';

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Movie } from '@/lib/types';
import { useMovies } from '@/lib/hooks/use-movies';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { spotlightRecommendations, SpotlightRecommendationsOutput as AIOutput } from '@/ai/flows/spotlight-recommendations';
import { getTopRatedMovies, getTrendingMovies, getUpcomingMovies, searchMovies } from '@/lib/services/tmdb';
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
      
      const [aiResult, trending, topRated, upcoming] = await Promise.all([
          spotlightRecommendations(aiInput),
          getTrendingMovies(),
          getTopRatedMovies(),
          getUpcomingMovies()
      ]);

      // 2. Fetch full data for AI-recommended titles
      const topPicksDetails = await Promise.all(aiResult.topPicks.map(fetchMovieDetails));
      const carouselsDetails = await Promise.all(
        aiResult.carousels.map(async (carousel) => ({
            title: carousel.title,
            recommendations: await Promise.all(carousel.recommendations.map(fetchMovieDetails))
        }))
      );
      
      const movieIdsInLibrary = new Set(movies.map(m => m.id));

      const populatedRecs: PopulatedSpotlightOutput = {
          topPicks: topPicksDetails.filter((m): m is Movie => m !== null && !movieIdsInLibrary.has(m.id)),
          carousels: carouselsDetails.map(c => ({
              ...c,
              recommendations: c.recommendations.filter((m): m is Movie => m !== null && !movieIdsInLibrary.has(m.id))
          }))
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
    const loadData = () => {
      try {
        const cachedData = localStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
        if (cachedData) {
          const { recommendations, trendingMovies, topRatedMovies, upcomingMovies, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
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
      // If no valid cache, fetch new data
      fetchAndCacheData();
    };

    if (!isLoadingMovies) {
      loadData();
    }
  }, [fetchAndCacheData, isLoadingMovies]);

  return (
    <RecommendationContext.Provider value={{ recommendations, trendingMovies, topRatedMovies, upcomingMovies, isLoading, refetch: fetchAndCacheData, removeRecommendation }}>
      {children}
    </RecommendationContext.Provider>
  );
}
