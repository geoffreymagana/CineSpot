'use client';
import { useParams } from 'next/navigation';
import { useMovies } from '@/lib/hooks/use-movies';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2 } from 'lucide-react';
import { PublicMovieHeader } from '@/components/movies/title/PublicMovieHeader';
import { CastList } from '@/components/movies/title/CastList';
import { MediaGallery } from '@/components/movies/title/MediaGallery';
import { getTitleDetails } from '@/lib/services/tmdb';
import { notFound } from 'next/navigation';
import type { Movie } from '@/lib/types';


export default async function PublicTitlePage({ params }: { params: { id: string }}) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    notFound();
  }

  const movieId = Number(id);
  let movie: Movie;

  try {
    // We can't determine media_type from ID alone, so we let getTitleDetails handle it.
    movie = await getTitleDetails(movieId);
  } catch (error) {
    console.error(`Failed to fetch public title details for ID ${id}:`, error);
    // If fetching fails (e.g., movie not found in TMDB), show a 404 page.
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main>
        <PublicMovieHeader movie={movie} />
        <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-12 relative z-10 -mt-24">
            {/* Public pages are read-only, so no episode tracker is needed. */}
            {movie.credits?.cast && <CastList cast={movie.credits.cast} />}
            {movie.images && <MediaGallery images={movie.images} />}
        </div>
      </main>
    </div>
  );
}