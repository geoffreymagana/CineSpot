
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Movie } from '@/lib/types';
import { Star } from 'lucide-react';
import { WatchStatusBadge } from './WatchStatusBadge';
import { getPosterUrl } from '@/lib/utils';


interface MovieCardProps {
  movie: Movie & { publicLink?: string };
  usePublicLink?: boolean;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: number) => void;
}

export function MovieCard({ movie, usePublicLink = false, selectionMode = false, selected = false, onToggleSelect }: MovieCardProps) {
  const href = usePublicLink ? movie.publicLink || `/title/${movie.id}` : `/title/${movie.id}`;
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect?.(movie.id);
  }

  return (
    <Link href={href} className="group relative">
      <Card className="overflow-hidden bg-card/50 transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 h-full flex flex-col">
        <div className="relative aspect-[2/3] w-full">
            <Image
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
            {movie.watchStatus && (
                <div className="absolute top-2 left-2 z-10">
                   <WatchStatusBadge status={movie.watchStatus} className="bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg" iconOnly />
                </div>
            )}

            {selectionMode && (
              <button onClick={handleCheckboxClick} aria-checked={selected} className="absolute top-2 right-2 z-20 bg-background/70 p-1 rounded-full border border-border">
                {selected ? '✓' : '○'}
                <span className="sr-only">Select {movie.title}</span>
              </button>
            )}
        </div>
        <CardContent className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <p className="font-bold text-white truncate text-sm group-hover:text-primary transition-colors">{movie.title}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{movie.release_date.substring(0, 4)}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
