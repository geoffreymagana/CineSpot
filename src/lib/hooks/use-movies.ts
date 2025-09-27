
'use client';
import { useContext } from 'react';
import { MovieContext } from '@/lib/contexts/MovieContext';


// This hook is now a simple wrapper around useContext
export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};
