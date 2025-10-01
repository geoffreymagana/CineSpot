
import { MovieCard } from './MovieCard';
import type { Movie } from '@/lib/types';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchX } from 'lucide-react';

interface MovieGridProps {
  movies: Movie[];
  selectionMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  linkPrefix?: string;
}

export function MovieGrid({ movies, selectionMode = false, selectedIds = [], onToggleSelect, linkPrefix = '/title' }: MovieGridProps) {
  if (movies.length === 0) {
    return (
        <EmptyState
            icon={<SearchX className="h-16 w-16 text-muted-foreground" />}
            title="No Titles Found"
            description="No titles found for this genre. Try selecting another one."
        />
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard 
            key={movie.id} 
            movie={movie} 
            selectionMode={selectionMode} 
            selected={selectedIds.includes(movie.id)} 
            onToggleSelect={onToggleSelect} 
            linkPrefix={linkPrefix} 
        />
      ))}
    </div>
  );
}
