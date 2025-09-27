
'use client';
import { useParams } from 'next/navigation';
import { useMovies } from '@/lib/hooks/use-movies';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2 } from 'lucide-react';
import { MovieHeader } from '@/components/movies/title/MovieHeader';
import { CastList } from '@/components/movies/title/CastList';
import { MediaGallery } from '@/components/movies/title/MediaGallery';
import { EpisodeTracker } from '@/components/movies/title/EpisodeTracker';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function TitleDetailPage() {
  useAuthGuard();
  const params = useParams();
  const { id } = params;
  const { getMovie, isLoading } = useMovies();

  const movieId = typeof id === 'string' ? Number(id) : 0;
  const movie = getMovie(movieId);

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
            description="This title could not be found in your library."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main>
        <MovieHeader movie={movie} />
        <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-12 relative z-10 -mt-24">
            {movie.media_type === 'tv' && movie.seasons && (
              <EpisodeTracker movie={movie} />
            )}
            {movie.credits?.cast && <CastList cast={movie.credits.cast} />}
            {movie.images && <MediaGallery images={movie.images} />}
        </div>
      </main>
    </div>
  );
}
