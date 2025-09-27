
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMovies } from '@/lib/hooks/use-movies';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search } from 'lucide-react';
import { getPosterUrl } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { movies } = useMovies();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);
  
  const debouncedQuery = useDebounce(query, 200);

  const filteredMovies = debouncedQuery 
    ? movies.filter(movie => {
        const lowerCaseQuery = debouncedQuery.toLowerCase();
        const titleMatch = movie.title.toLowerCase().includes(lowerCaseQuery);
        const genreMatch = movie.genres.some(genre => genre.name.toLowerCase().includes(lowerCaseQuery));
        return titleMatch || genreMatch;
      })
    : [];

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 justify-center rounded-md text-sm text-muted-foreground hover:bg-secondary/80 md:w-40 md:justify-start md:px-3 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5 md:h-4 md:w-4" />
        <span className="hidden md:inline-flex ml-2">Search library...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-[7px] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search by title or genre..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty className={debouncedQuery ? "py-6 text-center text-sm" : "hidden"}>
            No results found.
          </CommandEmpty>
          {filteredMovies.map(movie => (
            <CommandItem
              key={movie.id}
              value={`${movie.title}-${movie.id}`}
              onSelect={() => {
                runCommand(() => router.push(`/title/${movie.id}`));
              }}
            >
              <div className="flex items-center gap-4">
                 <div className="w-10 h-14 relative flex-shrink-0 rounded-sm overflow-hidden">
                    <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} fill className="object-cover" />
                 </div>
                 <div>
                    <p>{movie.title}</p>
                    <p className="text-xs text-muted-foreground">{movie.release_date.substring(0,4)}</p>
                 </div>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
