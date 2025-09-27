
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { getTitleDetails } from '@/lib/services/tmdb';
import type { Collection, Movie } from '@/lib/types';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Film } from 'lucide-react';
import Link from 'next/link';

async function getCollectionData(collectionId: string): Promise<{ collection: Omit<Collection, 'id'>, movies: Movie[] } | null> {
    const collectionsQuery = query(
        collectionGroup(db, 'collections'),
        where('__name__', '==', collectionId)
    );

    try {
        const querySnapshot = await getDocs(collectionsQuery);
        if (querySnapshot.empty) {
            console.warn(`No collection found with ID: ${collectionId}`);
            return null;
        }

        const collectionDoc = querySnapshot.docs[0];
        const collectionData = collectionDoc.data() as Omit<Collection, 'id'>;

        if (!collectionData.movieIds || collectionData.movieIds.length === 0) {
            return { collection: collectionData, movies: [] };
        }

        const moviePromises = collectionData.movieIds.map(id => getTitleDetails(id));
        const movies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);

        return { collection: collectionData, movies };

    } catch (error) {
        console.error("Error fetching shared collection:", error);
        return null;
    }
}


export default async function PublicCollectionPage({ params }: { params: { id: string } }) {
  const data = await getCollectionData(params.id);

  if (!data) {
    return (
      <div className="container px-4 py-10 md:px-6 lg:px-8">
        <EmptyState
          icon={<Film className="h-16 w-16 text-muted-foreground" />}
          title="Collection Not Found"
          description="We couldn't find the collection you're looking for. The link may be invalid or the collection may have been deleted."
        >
          <Button asChild size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  const { collection, movies } = data;

  const moviesWithPublicLinks = movies.map(movie => ({
    ...movie,
    publicLink: `/public/title/${movie.id}?media_type=${movie.media_type || 'movie'}`
  }));


  return (
    <div className="container px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8 mt-4">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {collection.description}
          </p>
        )}
      </div>

      {movies.length > 0 ? (
        <MovieGrid movies={moviesWithPublicLinks} usePublicLinks={true} />
      ) : (
          <EmptyState
          icon={<Film className="h-16 w-16 text-muted-foreground" />}
          title="This Collection is Empty"
          description="There are no titles in this collection yet."
        />
      )}
    </div>
  );
}

