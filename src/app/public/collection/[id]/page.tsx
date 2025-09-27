
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Collection, Movie } from '@/lib/types';
import { getTitleDetails } from '@/lib/services/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Film } from 'lucide-react';
import { PublicHeader } from '../../PublicHeader';

async function getCollection(
  uid: string,
  collectionId: string
): Promise<{ collection: Collection; movies: Movie[] } | null> {
  if (!uid || !collectionId) return null;

  try {
    const collectionRef = doc(db, 'users', uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);

    if (!collectionSnap.exists()) {
      return null;
    }

    const collectionData = {
      id: collectionSnap.id,
      ...collectionSnap.data(),
    } as Collection;

    const moviePromises = collectionData.movieIds.map(id =>
      getTitleDetails(id, undefined).catch(e => {
        console.error(`Failed to fetch details for movie ID ${id}`, e);
        return null;
      })
    );

    const movies = (await Promise.all(moviePromises)).filter(
      (m): m is Movie => m !== null
    );

    return { collection: collectionData, movies };
  } catch (error) {
    console.error('Error fetching public collection:', error);
    return null;
  }
}

export default async function PublicCollectionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { user?: string };
}) {
  const collectionId = params.id;
  const userId = searchParams.user;

  if (!userId) {
    notFound();
  }

  const data = await getCollection(userId, collectionId);

  if (!data) {
    notFound();
  }

  const { collection, movies } = data;

  const moviesWithPublicLinks = movies.map(movie => ({
    ...movie,
    publicLink: `/public/title/${movie.id}`,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6 lg:px-8">
          <div className="mb-8 max-w-4xl">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="mt-4 text-lg text-muted-foreground">
                {collection.description}
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              A publicly shared collection. To create your own, visit Cine-Spot.
            </p>
          </div>

          {movies.length > 0 ? (
            <MovieGrid movies={moviesWithPublicLinks} usePublicLinks={true} />
          ) : (
            <EmptyState
              icon={<Film className="h-16 w-16 text-muted-foreground" />}
              title="This Collection is Empty"
              description="There are no titles in this shared collection."
            />
          )}
        </div>
      </main>
    </div>
  );
}
