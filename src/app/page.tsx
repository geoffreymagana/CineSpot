
'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { GenreFilter } from '@/components/movies/GenreFilter';
import { EmptyState } from '@/components/common/EmptyState';
import { useMovies } from '@/lib/hooks/use-movies';
import { Button } from '@/components/ui/button';
import { AddMovieDialog } from '@/components/movies/AddMovieDialog';
import { Film } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthGuard } from '@/hooks/use-auth-guard';

const genres = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western', 'Foreign', 'Reality'
];

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] w-full">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  useAuthGuard();
  const { movies, isLoading } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      if (a.watchStatus === 'Completed' && b.watchStatus !== 'Completed') return 1;
      if (a.watchStatus !== 'Completed' && b.watchStatus === 'Completed') return -1;
      return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
    });
  }, [movies]);


  const filteredMovies = useMemo(() => {
    return sortedMovies
      .filter(movie => 
          !selectedGenre || movie.genres.some(g => g.name === selectedGenre)
      );
  }, [sortedMovies, selectedGenre]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-screen-2xl mx-auto px-4 py-6 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <GenreFilter
                    genres={genres}
                    selectedGenre={selectedGenre}
                    onSelectGenre={setSelectedGenre}
                />
            </div>
          
          <div className="mt-8">
            {isLoading ? (
              <MovieGridSkeleton />
            ) : movies.length === 0 ? (
              <EmptyState
                icon={<Film className="h-16 w-16 text-muted-foreground" />}
                title="Your Library is Empty"
                description="No titles yet. Add one to start your collection."
              >
                <AddMovieDialog>
                  <Button size="lg">Add Title</Button>
                </AddMovieDialog>
              </EmptyState>
            ) : (
              <MovieGrid movies={filteredMovies} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
