
'use client';
import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMovies } from '@/lib/hooks/use-movies';
import type { Movie } from '@/lib/types';
import { ArrowLeft, CheckCircle, Film, Loader2, PlusCircle, Search, Tv2 } from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';
import { AddToCollectionPopover } from '@/components/collections/AddToCollectionPopover';
import { getTitleDetails, searchMovies } from '@/lib/services/tmdb';
import { getPosterUrl } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';


function MovieDetailsView({ movie, onAdd, onBack }: { movie: Movie, onAdd: () => void, onBack: () => void }) {
    const { isMovieAdded } = useMovies();
    const { collections, addMovieToCollection, getCollectionsForMovie } = useCollections();

    const getReleaseYear = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).getFullYear() || 'N/A';
    }

    return (
        <div className="w-full text-center flex flex-col items-center p-6 pt-2">
            <Button onClick={onBack} variant="ghost" className="md:hidden self-start mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>
            <Image src={getPosterUrl(movie.backdrop_path)} alt={movie.title} width={300} height={169} className="rounded-lg object-cover mx-auto shadow-2xl mb-4" />
            <h3 className="font-headline text-2xl">{movie.title}</h3>
            <p className="text-muted-foreground text-sm">{getReleaseYear(movie.release_date)}</p>
            <p className="text-sm mt-4 line-clamp-4 text-left max-w-sm">{movie.overview}</p>
            
            <div className="mt-6 w-full max-w-sm flex flex-col gap-2">
                {isMovieAdded(movie.id) ? (
                    <Button disabled size="lg">
                        <CheckCircle className="mr-2" />
                        Added to Library
                    </Button>
                ) : (
                    <Button onClick={onAdd} size="lg">
                        <PlusCircle className="mr-2" />
                        Add to Library
                    </Button>
                )}
                
                {isMovieAdded(movie.id) && collections.length > 0 && (
                <AddToCollectionPopover
                    collections={collections}
                    movieCollections={getCollectionsForMovie(movie.id)}
                    onSelectCollection={(collectionId) => addMovieToCollection(collectionId, movie.id)}
                />
                )}
            </div>
        </div>
    )
}

function SearchResultsView({ query, onSelectMovie }: { query: string, onSelectMovie: (movie: Movie) => void }) {
    const [isSearching, startSearchTransition] = useTransition();
    const [filteredResults, setFilteredResults] = useState<Movie[]>([]);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery) {
        startSearchTransition(async () => {
            const results = await searchMovies(debouncedQuery);
            setFilteredResults(results);
        });
        } else {
        setFilteredResults([]);
        }
    }, [debouncedQuery]);
    
    const getReleaseYear = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).getFullYear() || 'N/A';
    }

    return (
        <>
             <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
                {isSearching && <Loader2 className="animate-spin mx-auto mt-4" />}
                {!isSearching && filteredResults.length > 0 && (
                    <ul className="space-y-2">
                        {filteredResults.map(movie => (
                            <li key={movie.id} onClick={() => onSelectMovie(movie)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors hover:bg-secondary`}>
                                <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} width={40} height={60} className="rounded-md object-cover" />
                                <div className="flex-1">
                                    <p className="font-semibold">{movie.title}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        {movie.media_type === 'movie' ? <Film className="h-4 w-4" /> : <Tv2 className="h-4 w-4" />}
                                        <span>{getReleaseYear(movie.release_date)}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {!isSearching && debouncedQuery && filteredResults.length === 0 && (
                    <p className="text-center text-muted-foreground pt-8">No results for "{debouncedQuery}"</p>
                )}
                {!query && (
                    <div className="text-center pt-16">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="mt-4 text-muted-foreground">Search TMDB to find titles.</p>
                    </div>
                )}
            </div>
        </>
    )
}

export function AddMovieDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { addMovie } = useMovies();
 
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  }

  const handleAddMovie = async () => {
    if (selectedMovie) {
      const fullDetails = await getTitleDetails(selectedMovie.id, selectedMovie.media_type || 'movie');
      addMovie(fullDetails);
    }
  };
  
  // Reset state on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedMovie(null);
    }
  }, [open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md md:max-w-3xl lg:max-w-4xl max-h-[90vh] bg-card grid-rows-[auto_1fr] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">Add a Title</DialogTitle>
          <DialogDescription>Search for a movie, TV show, or documentary to add to your collection.</DialogDescription>
        </DialogHeader>

        {/* Mobile View */}
        <div className="md:hidden overflow-y-auto">
            {!selectedMovie ? (
                 <div className="p-6 pt-2 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search TMDB..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <SearchResultsView query={query} onSelectMovie={handleSelectMovie} />
                 </div>
            ) : (
                <MovieDetailsView movie={selectedMovie} onAdd={handleAddMovie} onBack={() => setSelectedMovie(null)} />
            )}
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 overflow-hidden">
             <div className="p-6 pt-2 flex flex-col gap-4 border-r">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search TMDB..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                 <SearchResultsView query={query} onSelectMovie={handleSelectMovie} />
             </div>
            <div className="bg-secondary/50 p-6 flex-col justify-center items-center flex">
                {selectedMovie ? (
                    <MovieDetailsView movie={selectedMovie} onAdd={handleAddMovie} onBack={() => {}} />
                ) : (
                    <div className="text-center text-muted-foreground">
                        <Film className="h-16 w-16 mx-auto" />
                        <p className="mt-4">Select a title to see details.</p>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
