'use server';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Collection, Movie } from '@/lib/types';
import { getTitleDetails } from '@/lib/services/tmdb';
import { notFound } from 'next/navigation';
import { MovieGrid } from '@/components/movies/MovieGrid';
import PublicCollectionActions from '../PublicCollectionActions';
import { EmptyState } from '@/components/common/EmptyState';
import { Film } from 'lucide-react';
import Link from 'next/link';

async function getCollection(
  uid: string,
  collectionId: string
): Promise<{ collection: Collection; movies: Movie[] } | null> {
  if (!uid || !collectionId) {
    return null;
  }
  try {
    const collectionRef = doc(db, 'users', uid, 'collections', collectionId);
    const collectionSnap = await getDoc(collectionRef);

    if (!collectionSnap.exists()) {
      return null;
    }

    const collection = { id: collectionSnap.id, ...collectionSnap.data() } as Collection;

    const moviePromises = collection.movieIds.map(id => getTitleDetails(id).catch(() => null));
    const resolvedMovies = await Promise.all(moviePromises);
    const movies = resolvedMovies.filter((m): m is Movie => m !== null);

    return { collection, movies };
  } catch (error) {
    console.error("Failed to fetch public collection:", error);
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
  const data = await getCollection(searchParams.user || '', params.id);

  if (!data) {
    notFound();
  }

  const { collection, movies } = data;
  
  const moviesWithPublicLinks = movies.map(movie => ({
    ...movie,
    publicLink: `/public/title/${movie.id}?media_type=${movie.media_type || 'movie'}`
  }));

  return (
    <main className="flex-1">
      <div className="container px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
            {collection.name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {collection.description}
          </p>
        </div>

        {movies.length > 0 ? (
          <>
            <PublicCollectionActions movies={movies} />
            <MovieGrid movies={moviesWithPublicLinks} usePublicLinks={true} />
          </>
        ) : (
          <EmptyState
            icon={<Film className="h-16 w-16 text-muted-foreground" />}
            title="This Collection is Empty"
            description="There are no titles in this collection yet."
          />
        )}
      </div>
    </main>
  );
}