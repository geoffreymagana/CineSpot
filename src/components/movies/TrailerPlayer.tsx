
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Movie } from '@/lib/types';
import { PlayCircle } from 'lucide-react';

interface TrailerPlayerProps {
  videos: Movie['videos'];
  children: React.ReactNode;
}

export function TrailerPlayer({ videos, children }: TrailerPlayerProps) {
  const trailer = videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  if (!trailer) {
    // You could also return a disabled button
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl aspect-video p-0 border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{trailer.name}</DialogTitle>
        </DialogHeader>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
          title={trailer.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </DialogContent>
    </Dialog>
  );
}
