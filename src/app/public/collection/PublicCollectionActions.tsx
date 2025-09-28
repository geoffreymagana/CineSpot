"use client";

import { Button } from '@/components/ui/button';
import { useMovies } from '@/lib/hooks/use-movies';
import { useToast } from '@/hooks/use-toast';
import type { Movie } from '@/lib/types';
import { AddToCollectionPopover } from '@/components/collections/AddToCollectionPopover';
import { useState } from 'react';

export default function PublicCollectionActions({ movies }: { movies: Movie[] }) {
  const { addMovie, isMovieAdded } = useMovies();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAddAll = async () => {
    setLoading(true);
    try {
      for (const m of movies) {
        if (!isMovieAdded(m.id)) {
          await addMovie(m);
        }
      }
      toast({ title: 'Added', description: 'All titles added to your library.' });
    } catch (e) {
      console.error('Failed to add all titles', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add all titles.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <Button onClick={handleAddAll} disabled={loading}>
        Add All to Library
      </Button>
      <a href="https://docs.google.com/forms/d/e/1FAIpQLSfExampleForm" target="_blank" rel="noreferrer">
        <Button variant="outline">Provide Feedback</Button>
      </a>
    </div>
  );
}
