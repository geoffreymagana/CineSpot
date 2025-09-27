
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getTitleDetails } from '@/lib/services/tmdb';
import type { Collection, Movie } from '@/lib/types';
import { PublicHeader } from '@/app/public/PublicHeader';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Film } from 'lucide-react';

async function getCollection(
  userId: string,
  collectionId: string
): Promise<{ collection: Collection; movies: Movie[] } | null> {
  try {
    const collectionRef = doc(db, 'users', userId, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);

    if (!collectionSnap.exists()) {
      return null;
    }

    const collectionData = {
      id: collectionSnap.id,
      ...collectionSnap.data(),
    } as Collection;

    const moviePromises = collectionData.movieIds.map(id =>
      getTitleDetails(id).catch(e => {
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
    return notFound();
  }

  const data = await getCollection(userId, collectionId);

  if (!data) {
    return notFound();
  }

  const { collection, movies } = data;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="container px-4 py-10 md:px-6 lg:px-8">
          <div className="mb-8 max-w-4xl">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {collection.name}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {collection.description}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A shared collection from Cine-Spot
            </p>
          </div>

          {movies.length > 0 ? (
            <MovieGrid movies={movies.map(m => ({ ...m, publicLink: `/public/title/${m.id}`}))} usePublicLinks={true} />
          ) : (
            <EmptyState
              icon={<Film className="h-16 w-16 text-muted-foreground" />}
              title="This Collection is Empty"
              description="There are no titles in this shared collection yet."
            />
          )}
        </div>
      </main>
    </div>
  );
}
