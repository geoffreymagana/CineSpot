
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Film, Loader2, SearchX, Check, PlusCircle, Import } from 'lucide-react';
import { getTitleDetails } from '@/lib/services/tmdb';
import type { Movie, Collection } from '@/lib/types';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { useAuth } from '@/hooks/use-auth';
import { useMovies } from '@/lib/hooks/use-movies';
import { useCollections } from '@/hooks/use-collections';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { doc, getDoc, firestoreCollection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Label } from '@/components/ui/label';

interface PublicCollectionData {
  ownerName: string;
  collection: {
    id: string;
    name: string;
    description?: string;
    movieIds: number[];
  };
}

export default function PublicCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const { addMovie, movies: libraryMovies } = useMovies();
  const { createCollection } = useCollections();
  const { toast } = useToast();

  const [data, setData] = useState<PublicCollectionData | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchCollection = async () => {
      if (typeof id !== 'string') {
        setIsLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'shared_collections', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as PublicCollectionData;
          setData(fetchedData);
          const moviePromises = fetchedData.collection.movieIds.map(movieId =>
            getTitleDetails(movieId)
          );
          const moviesData = await Promise.all(moviePromises);
          setMovies(moviesData.filter(Boolean) as Movie[]);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Failed to fetch shared collection:', error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollection();
  }, [id]);

  const libraryMovieIds = useMemo(() => new Set(libraryMovies.map(m => m.id)), [libraryMovies]);

  const toggleSelect = (movieId: number) => {
    setSelectedIds(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const handleAddSelected = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    const moviesToAdd = movies.filter(m => selectedIds.includes(m.id));
    try {
      await Promise.all(moviesToAdd.map(m => addMovie(m)));
      toast({
        title: 'Titles Added',
        description: `${moviesToAdd.length} title(s) added to your library.`,
      });
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to add selected titles:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add titles.' });
    }
  };

  const handleImportCollection = async () => {
    if (!user || !data) {
      router.push('/auth/login');
      return;
    }
    try {
      // Add all movies to library first
      await Promise.all(movies.map(m => addMovie(m)));
      
      // Then create the new collection with all the movie IDs
      await createCollection({
        name: data.collection.name,
        description: data.collection.description,
        movieIds: data.collection.movieIds,
      });

      toast({
        title: 'Collection Imported',
        description: `"${data.collection.name}" and its titles have been added to your account.`,
      });
      router.push('/collections');
    } catch (error) {
      console.error('Failed to import collection:', error);
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: 'Could not import the collection.',
      });
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

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={<SearchX className="h-16 w-16 text-muted-foreground" />}
            title="Collection Not Found"
            description="This shared collection could not be found."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
                {data.collection.name}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Shared by <em className="text-primary not-italic">{data.ownerName}</em>
              </p>
            </div>
            
            {user && (
              <div className="mb-6 flex flex-wrap gap-4 items-center border p-4 rounded-lg bg-card/50">
                  <div className="flex-1">
                    <h3 className="font-semibold">Import to Your Library</h3>
                    <p className="text-sm text-muted-foreground">You can import the full collection or select individual titles to add.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddSelected} disabled={selectedIds.length === 0}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Selected ({selectedIds.length})
                    </Button>
                    <Button variant="secondary" onClick={handleImportCollection}>
                      <Import className="mr-2 h-4 w-4" /> Import Full Collection
                    </Button>
                  </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-4 p-2 rounded-lg">
                <Checkbox
                  id="select-all"
                  checked={selectedIds.length > 0 && selectedIds.length === movies.length}
                  onCheckedChange={(checked) => setSelectedIds(checked ? movies.map(m => m.id) : [])}
                />
                <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                  {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select All'}
                </Label>
            </div>

            {movies.length > 0 ? (
              <MovieGrid
                movies={movies}
                selectionMode={!!user}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                linkPrefix="/public/title"
              />
            ) : (
              <EmptyState
                icon={<Film className="h-16 w-16 text-muted-foreground" />}
                title="This Collection is Empty"
                description="The owner hasn't added any titles to this collection yet."
              />
            )}
          </div>
        </main>
    </div>
  );
}
