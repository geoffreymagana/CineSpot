
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2 } from 'lucide-react';
import { PublicMovieHeader } from '@/components/movies/title/PublicMovieHeader';
import { CastList } from '@/components/movies/title/CastList';
import { MediaGallery } from '@/components/movies/title/MediaGallery';
import { getTitleDetails } from '@/lib/services/tmdb';
import type { Movie } from '@/lib/types';
import { useMovies } from '@/lib/hooks/use-movies';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function PublicTitlePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addMovie, isMovieAdded } = useMovies();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const movieId = typeof id === 'string' ? Number(id) : 0;
  const isAdded = isMovieAdded(movieId);

  useEffect(() => {
    if (movieId > 0) {
      if (user && isAdded) {
        // If the user is logged in and already has this movie, just go to their private page for it
        router.replace(`/title/${movieId}`);
        return;
      }

      setIsLoading(true);
      getTitleDetails(movieId)
        .then(data => setMovie(data))
        .catch(err => {
          console.error("Failed to fetch public title details", err);
          setMovie(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [movieId, user, isAdded, router]);

  const handleAddAndRedirect = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (movie) {
      try {
        await addMovie(movie);
        toast({
          title: "Added to Library!",
          description: `"${movie.title}" has been added to your library.`
        });
        // After adding, redirect to the main (private) title page
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
            title="Title Not Found"
            description="This title could not be found."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main>
        <PublicMovieHeader movie={movie}>
             {isAdded ? (
              <Button size="lg" disabled>
                <CheckCircle className="mr-2" />
                In Your Library
              </Button>
            ) : (
              <Button size="lg" onClick={handleAddAndRedirect}>
                <PlusCircle className="mr-2" />
                Add to Library
              </Button>
            )}
        </PublicMovieHeader>
        <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-12 relative z-10 -mt-24">
            {movie.credits?.cast && <CastList cast={movie.credits.cast} />}
            {movie.images && <MediaGallery images={movie.images} />}
        </div>
      </main>
    </div>
  );
}

