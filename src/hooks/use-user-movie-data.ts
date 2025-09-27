
'use client';
import { useContext } from 'react';
import { UserMovieDataContext } from '@/lib/contexts/UserMovieDataContext';

// This hook is a simple wrapper around useContext
export const useUserMovieData = () => {
  const context = useContext(UserMovieDataContext);
  if (context === undefined) {
    throw new Error('useUserMovieData must be used within a UserMovieDataProvider');
  }
  return context;
};
