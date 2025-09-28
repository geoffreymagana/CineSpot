'use server';

import { notFound } from 'next/navigation';
import { getTitleDetails } from '@/lib/services/tmdb';
import { PublicMovieHeader } from '@/components/movies/title/PublicMovieHeader';
import { CastList } from '@/components/movies/title/CastList';
import { MediaGallery } from '@/components/movies/title/MediaGallery';

export default async function PublicTitlePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { media_type?: 'movie' | 'tv' };
}) {
  const movieId = Number(params.id);
  if (isNaN(movieId)) {
    notFound();
  }

  let movie = null;
  try {
    movie = await getTitleDetails(movieId, searchParams.media_type);
  } catch (e) {
    console.error('Failed to fetch title details', e);
    // If TMDB fetch fails (network or API error), show notFound to avoid crashing the renderer
    notFound();
  }

  if (!movie) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main>
        <PublicMovieHeader movie={movie} />
        <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-12 relative z-10 -mt-24">
            {movie.credits?.cast && <CastList cast={movie.credits.cast} />}
            {movie.images && <MediaGallery images={movie.images} />}
        </div>
      </main>
    </div>
  );
}