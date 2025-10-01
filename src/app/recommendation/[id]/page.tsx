
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2 } from 'lucide-react';
import { MovieHeader } from '@/components/movies/title/MovieHeader';
import { CastList } from '@/components/movies/title/CastList';
import { MediaGallery } from '@/components/movies/title/MediaGallery';
import { getTitleDetails } from '@/lib/services/tmdb';
import type { Movie } from '@/lib/types';
import { useMovies } from '@/lib/hooks/use-movies';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PublicMovieHeader } from '@/components/movies/title/PublicMovieHeader';
import { useAuth } from '@/hooks/use-auth';
import { processRecommendationFeedback } from '@/ai/flows/recommendation-feedback-flow';
import { FeedbackDialog } from '@/components/movies/FeedbackDialog';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { useRecommendations } from '@/hooks/use-recommendations';
import { cn } from '@/lib/utils';


export default function RecommendationDetailPage() {
  useAuthGuard();
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addMovie, isMovieAdded } = useMovies();
  const { toast } = useToast();
  const { user } = useAuth();
  const { updateUserData, getUserDataForMovie } = useUserMovieData();
  const { removeRecommendation } = useRecommendations();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackLoading, setFeedbackLoading] = useState(false);
  const [isFeedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const movieId = typeof id === 'string' ? Number(id) : 0;
  const movieUserData = getUserDataForMovie(movieId);
  const hasLiked = movieUserData?.lastFeedback?.liked === true;
  const hasDisliked = movieUserData?.lastFeedback?.liked === false;
  
  useEffect(() => {
    if (movieId > 0) {
      if (isMovieAdded(movieId)) {
        // If it's already in the library, just go to the main title page.
        router.replace(`/title/${movieId}`);
        return;
      }

      setIsLoading(true);
      getTitleDetails(movieId)
        .then(data => setMovie(data))
        .catch(err => {
          console.error("Failed to fetch recommendation details", err);
          setMovie(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movieId, isMovieAdded, router]);


  const handleAddAndRedirect = async () => {
    if (movie) {
      try {
        await addMovie(movie);
        toast({
          title: "Added to Library!",
          description: `"${movie.title}" has been added to your library.`
        });
        // Redirect to the main title page after adding
        router.push(`/title/${movie.id}`);
      } catch (error) {
        console.error("Failed to add movie:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not add the movie to your library."
        });
      }
    }
  };

  const handleFeedback = async (liked: boolean, reason?: string) => {
    if (!movie || !user || isFeedbackLoading) return;
    setFeedbackLoading(true);
    
    try {
      // If user clicks the same button again, undo the feedback
      if (movieUserData?.lastFeedback?.liked === liked) {
        await updateUserData(movie.id, { lastFeedback: undefined } as any);
        return;
      }

      // Persist feedback to influence future local heuristics
      await updateUserData(movie.id, { lastFeedback: { liked, reason, timestamp: new Date().toISOString() } } as any);
      
      // Send feedback to AI flow
      await processRecommendationFeedback({ userId: user.uid, title: movie.title, liked, reason });
      
      toast({
        title: 'Feedback received!',
        description: `Thanks — your feedback helps improve recommendations.`
      });

      if (!liked) {
        removeRecommendation(movie.id);
      }
    } catch (e) {
      console.warn('Failed to send feedback to AI flow', e);
      toast({
        variant: 'destructive',
        title: 'Feedback Error',
        description: 'Could not save your feedback. Please try again.'
      })
    } finally {
      setFeedbackLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin" />
        </main>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={<Film className="h-16 w-16 text-muted-foreground" />}
            title="Recommendation Not Found"
            description="This title could not be found."
          />
        </main>
      </div>
    );
  }
  
  // A bit of a hack: re-use the public header but override the action button
  const PublicHeaderWithAction = ({ movie }: { movie: Movie }) => {
    const isAdded = isMovieAdded(movie.id);
    
    return (
      <PublicMovieHeader movie={movie}>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {isAdded ? (
              <Button size="lg" disabled>
                <CheckCircle className="mr-2" />
                In Library
              </Button>
            ) : (
              <Button size="lg" onClick={handleAddAndRedirect}>
                <PlusCircle className="mr-2" />
                Add to Library
              </Button>
            )}
            <Button 
                size="lg" 
                variant="outline" 
                disabled={isFeedbackLoading}
                className={cn(
                    "bg-transparent border-white/20 hover:bg-white/10",
                    hasLiked && "border-primary/80"
                )}
                onClick={() => handleFeedback(true)}
            >
                {isFeedbackLoading && hasLiked ? <Loader2 className="animate-spin" /> : <ThumbsUp className={cn(hasLiked && "fill-current")} />}
            </Button>
            <FeedbackDialog
                open={isFeedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
                title={movie.title}
                onSubmit={(reason) => handleFeedback(false, reason)}
            >
                <Button 
                    size="lg" 
                    variant="outline"
                    disabled={isFeedbackLoading}
                    className={cn(
                        "bg-transparent border-white/20 hover:bg-white/10",
                        hasDisliked && "border-destructive/80"
                    )}
                >
                    {isFeedbackLoading && hasDisliked ? <Loader2 className="animate-spin" /> : <ThumbsDown className={cn(hasDisliked && "fill-current")} />}
                </Button>
            </FeedbackDialog>
        </div>
      </PublicMovieHeader>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main>
        <PublicHeaderWithAction movie={movie} />
        <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-12 relative z-10 -mt-24">
            {movie.credits?.cast && <CastList cast={movie.credits.cast} />}
            {movie.images && <MediaGallery images={movie.images} />}
        </div>
      </main>
    </div>
  );
}
