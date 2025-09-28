
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Sparkles, Star, TrendingUp, Calendar } from 'lucide-react';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RecommendationCarousel } from '@/components/movies/RecommendationCarousel';
import { getTitleDetails } from '@/lib/services/tmdb';
import { useMovies } from '@/lib/hooks/use-movies';
import { useRecommendations } from '@/hooks/use-recommendations';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { useAuth } from '@/hooks/use-auth';
import { processRecommendationFeedback } from '@/ai/flows/recommendation-feedback-flow';


function SpotlightSection({
  title,
  icon,
  movies,
  isLoading,
  titleClassName,
}: {
  title: React.ReactNode;
  icon: React.ReactNode;
  movies: Movie[];
  isLoading?: boolean;
  titleClassName?: string;
}) {
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  const moviesWithPublicLinks = movies.map(movie => ({
    ...movie,
    publicLink: `/public/title/${movie.id}?media_type=${movie.media_type || 'movie'}`
  }));


  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2
          className={cn(
            'font-headline text-2xl font-extrabold tracking-tight text-white',
            titleClassName
          )}
        >
          {title}
        </h2>
      </div>
      <MovieGrid movies={moviesWithPublicLinks} usePublicLinks={true} />
    </div>
  );
}

function CarouselTitle({rawTitle}: {rawTitle: string}){
    const parts = rawTitle.split(/because you (?:watched|added|liked) /i);
    if(parts.length > 1) {
        const actionPart = rawTitle.match(/because you (?:watched|added|liked)/i);
        const title = parts[1];
        return <>{actionPart?.[0]} <span className="text-primary">{title}</span></>
    }
    return <>{rawTitle}</>
}

export default function SpotlightPage() {
  useAuthGuard();
  const { addMovie, isMovieAdded } = useMovies();
  const { updateUserData } = useUserMovieData();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
      recommendations,
      trendingMovies,
      topRatedMovies,
      upcomingMovies,
      isLoading: isLoadingRecommendations,
      removeRecommendation,
  } = useRecommendations();


  const handleCollect = async (movie: Movie) => {
    if (isMovieAdded(movie.id)) {
      // Already in library: nothing to do in-place
      toast({ title: 'Already in library', description: `${movie.title} is already in your library.` });
      return;
    }
    try {
        const fullDetails = await getTitleDetails(movie.id, movie.media_type || 'movie');
        await addMovie(fullDetails);
        // Update UI and cache, but do not navigate away — keep user in Spotlight as requested
        removeRecommendation(movie.id);
        toast({
          title: "Added to Library!",
          description: `"${movie.title}" is now in your library.`
        });
    } catch(e) {
        console.error("Error collecting title:", e);
        toast({
            variant: 'destructive',
            title: "Error collecting title",
            description: "There was an issue adding this title to your library. Please try again."
        })
    }
  };

  const handleFeedback = async (movie: Movie, liked: boolean, reason?: string) => {
    // Persist feedback to user data so it influences heuristics later (optimistic)
    try {
      await updateUserData(movie.id, { lastFeedback: { liked, reason, timestamp: new Date().toISOString() } } as any);
    } catch (err) {
      console.error('Failed to persist local feedback', err);
    }

    try {
      await processRecommendationFeedback({ userId: user?.uid || (window as any).__user?.uid || 'unknown', title: movie.title, liked, reason });
    } catch (e) {
      console.error('Failed to send feedback to AI flow', e);
    }

    // Show immediate acknowledgement
    toast({
      title: 'Feedback received!',
      description: `Thanks — your feedback helps improve recommendations.`
    });

    // Do not automatically remove the item for thumbs-up; thumbs-down may stay visible so the user
    // can reverse the decision. If you want to hide immediately, uncomment the next line.
    // if (!liked) removeRecommendation(movie.id);
  };


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">

        {isLoadingRecommendations && (!recommendations || recommendations.topPicks.length === 0) ? (
          <Skeleton className="w-full h-[60vh] md:h-[80vh]" />
        ) : recommendations && recommendations.topPicks.length > 0 ? (
          <>
            <RecommendationCarousel
              movies={recommendations.topPicks.map(m => ({ ...m, publicLink: `/public/title/${m.id}?media_type=${m.media_type || 'movie'}` }))}
              onCollect={handleCollect}
              onFeedback={handleFeedback}
            />
            <div className="container px-4 py-6 md:px-6 lg:px-8">
              <div className="mt-8">
                {recommendations?.carousels.map((carousel) => (
                    <SpotlightSection
                        key={carousel.title}
                        title={<CarouselTitle rawTitle={carousel.title} />}
                        icon={<Sparkles className="h-6 w-6 text-primary" />}
                        movies={carousel.recommendations}
                        isLoading={isLoadingRecommendations}
                    />
                ))}

                {/* Only render a separate Trending Now section if the carousels didn't already include it */}
                {!recommendations?.carousels?.some(c => c.title.toLowerCase() === 'trending now') && (
                 <SpotlightSection
                  title="Trending Now"
                  icon={<TrendingUp className="h-6 w-6 text-primary" />}
                  movies={trendingMovies}
                  isLoading={isLoadingRecommendations}
                />
                )}
                <SpotlightSection
                  title="Top Rated"
                  icon={<Star className="h-6 w-6 text-amber-400 fill-amber-400" />}
                  movies={topRatedMovies}
                  isLoading={isLoadingRecommendations}
                />
                 <SpotlightSection
                  title="Upcoming"
                  icon={<Calendar className="h-6 w-6 text-primary" />}
                  movies={upcomingMovies}
                  isLoading={isLoadingRecommendations}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="container px-4 py-6 md:px-6 lg:px-8">
            <div className="mt-8">
              <SpotlightSection
                title="Trending Now"
                icon={<TrendingUp className="h-6 w-6 text-primary" />}
                movies={trendingMovies}
                isLoading={isLoadingRecommendations}
              />
              <SpotlightSection
                title="Top Rated"
                icon={<Star className="h-6 w-6 text-amber-400 fill-amber-400" />}
                movies={topRatedMovies}
                isLoading={isLoadingRecommendations}
              />
              <SpotlightSection
                title="Upcoming"
                icon={<Calendar className="h-6 w-6 text-primary" />}
                movies={upcomingMovies}
                isLoading={isLoadingRecommendations}
              />
            </div>
          </div>
        )
        }
      </main>
    </div>
  );
}
