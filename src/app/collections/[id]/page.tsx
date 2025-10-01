
'use client';

import { useParams } from 'next/navigation';
import { useCollections } from '@/hooks/use-collections';
import { useMovies } from '@/lib/hooks/use-movies';
import { Header } from '@/components/layout/Header';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EditCollectionDialog } from '@/components/collections/EditCollectionDialog';
import { useMemo } from 'react';
import { ShareCollectionPopover } from '@/components/collections/ShareCollectionPopover';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function CollectionDetailPage() {
  useAuthGuard();
  const params = useParams();
  const { id } = params;
  const { collections, isLoading: isLoadingCollections } = useCollections();
  const { movies, isLoading: isLoadingMovies } = useMovies();

  const collectionId = typeof id === 'string' ? id : '';
  const collection = collections.find(c => c.id === collectionId);


  const isLoading = isLoadingCollections || isLoadingMovies;

  const collectionMovies = useMemo(() => {
    return (collection
      ? movies.filter(movie => collection.movieIds.includes(movie.id))
      : []
    )
  }, [collection, movies]);

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

  if (!collection) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container px-4 py-10 md:px-6 lg:px-8">
            <EmptyState
              icon={<Film className="h-16 w-16 text-muted-foreground" />}
              title="Collection Not Found"
              description="We couldn't find the collection you're looking for."
            >
              <Button asChild size="lg">
                <Link href="/collections">Back to Collections</Link>
              </Button>
            </EmptyState>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 lg:px-8">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
                {collection.name}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {collection.description}
              </p>
            </div>
            <div className="flex gap-2">
              <ShareCollectionPopover collectionId={collection.id}>
                <Button variant="secondary">Share</Button>
              </ShareCollectionPopover>
              <EditCollectionDialog collection={collection}>
                <Button variant="outline">Edit Collection</Button>
              </EditCollectionDialog>
            </div>
          </div>

          {collectionMovies.length > 0 ? (
            <MovieGrid movies={collectionMovies} />
          ) : (
             <EmptyState
              icon={<Film className="h-16 w-16 text-muted-foreground" />}
              title="This Collection is Empty"
              description="You haven't added any titles to this collection yet."
            >
              <EditCollectionDialog collection={collection} openOnTrigger={true}>
                 <Button size="lg">Add a Title</Button>
              </EditCollectionDialog>
            </EmptyState>
          )}
        </div>
      </main>
    </div>
  );
}
