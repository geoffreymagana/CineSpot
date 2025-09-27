'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
}

export function GenreFilter({ genres, selectedGenre, onSelectGenre }: GenreFilterProps) {
  return (
    <ScrollArea className="w-full max-w-full">
      <div className="flex w-max space-x-2 pb-4 md:justify-end">
        <Button
          variant={selectedGenre === null ? 'default' : 'secondary'}
          onClick={() => onSelectGenre(null)}
        >
          All
        </Button>
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={selectedGenre === genre ? 'default' : 'secondary'}
            onClick={() => onSelectGenre(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
