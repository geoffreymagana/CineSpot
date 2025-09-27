
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTitleDetails } from '@/lib/services/tmdb';
import { Collection, Movie } from '@/lib/types';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

async function getCollection(
  uid: string,
  collectionId: string
): Promise<{ collection: Omit<Collection, 'id'>; movies: Movie[] } | null> {
  try {
    const collectionRef = doc(db, 'users', uid, 'collections', collectionId);
    const docSnap = await getDoc(collectionRef);

    if (!docSnap.exists()) {
      return null;
    }

    const collectionData = docSnap.data() as Omit<Collection, 'id'>;

    const moviePromises = collectionData.movieIds.map(movieId =>
      getTitleDetails(movieId)
    );

    const movies = (await Promise.all(moviePromises)).filter(
      (m): m is Movie => m !== null
    );

    return {
      collection: collectionData,
      movies,
    };
  } catch (error) {
    console.error('Error fetching public collection:', error);
    return null;
  }
}

export default async function PublicCollectionPage({
  params,
}: {
  params: { uid: string; id: string };
}) {
  const data = await getCollection(params.uid, params.id);

  if (!data) {
    notFound();
  }

  const { collection, movies } = data;

  const moviesWithPublicLinks = movies.map(movie => ({
    ...movie,
    publicLink: `/public/title/${movie.id}?media_type=${
      movie.media_type || 'movie'
    }`,
  }));

  return (
    <main className="flex-1">
      <div className="container px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
            {collection.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {collection.description}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            A shared collection.
          </p>
        </div>

        {moviesWithPublicLinks.length > 0 ? (
          <MovieGrid movies={moviesWithPublicLinks} usePublicLinks={true} />
        ) : (
          <EmptyState
            icon={<Film className="h-16 w-16 text-muted-foreground" />}
            title="This Collection is Empty"
            description="There are no titles in this shared collection yet."
          />
        )}
      </div>
    </main>
  );
}
