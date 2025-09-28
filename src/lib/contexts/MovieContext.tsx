
'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { Movie } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const MOVIES_COLLECTION = 'movies';

interface MovieContextType {
  movies: Movie[];
  addMovie: (movie: Movie) => Promise<void>;
  removeMovie: (movieId: number) => Promise<void>;
  updateMovie: (movieId: number, data: Partial<Movie>) => Promise<void>;
  isMovieAdded: (movieId: number) => boolean;
  getMovie: (movieId: number) => Movie | undefined;
  isLoading: boolean;
  refetch: () => void;
}

export const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setMovies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const moviesRef = collection(db, 'users', user.uid, MOVIES_COLLECTION);
    
    const unsubscribe = onSnapshot(moviesRef, 
        (querySnapshot) => {
            let moviesData = querySnapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Movie));

            // Sort: prefer not-completed items first (most recently added at top),
            // then completed items at the bottom. Use `addedAt` if available, fallback to release_date.
            const withAddedAt = moviesData.map(m => ({
              ...m,
              _addedAt: (() => {
                const a = (m as any).addedAt;
                if (!a) return m.release_date ? new Date(m.release_date).getTime() : 0;
                try {
                  return typeof a.toMillis === 'function' ? a.toMillis() : new Date(a).getTime();
                } catch (e) {
                  return new Date(String(a)).getTime();
                }
              })(),
            }));

            const notCompleted = withAddedAt.filter(m => m.watchStatus !== 'Completed').sort((a,b) => (b._addedAt || 0) - (a._addedAt || 0));
            const completed = withAddedAt.filter(m => m.watchStatus === 'Completed').sort((a,b) => (b._addedAt || 0) - (a._addedAt || 0));

            const sorted = [...notCompleted, ...completed].map(({_addedAt, ...rest}) => rest as Movie);

            setMovies(sorted);
            setIsLoading(false);
        }, 
        (error) => {
            console.error("Failed to fetch movies from Firestore", error);
            toast({
                variant: "destructive",
                title: "Loading Error",
                description: "Could not sync your movie library."
            });
            setIsLoading(false);
        }
    );

    return () => unsubscribe();
  }, [user, toast]);


  const addMovie = async (movie: Movie) => {
    if (!user) throw new Error("User not authenticated.");
    if (movies.some(m => m.id === movie.id)) return;

    const movieWithDefaults = {
      ...movie,
      watchStatus: movie.watchStatus || 'Plan to Watch',
      rewatchCount: movie.rewatchCount || 0,
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid, MOVIES_COLLECTION, String(movie.id)), { ...movieWithDefaults, addedAt: serverTimestamp() as any });
       toast({
        title: "Added to Library",
        description: `"${movie.title}" has been added to your library.`
       });
    } catch (error) {
       console.error("Failed to add movie to Firestore", error);
       toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not save the movie to your library."
       });
       throw error;
    }
  };

  const removeMovie = async (movieId: number) => {
    if (!user) throw new Error("User not authenticated.");
    const movieToRemove = movies.find(m => m.id === movieId);

    try {
      await deleteDoc(doc(db, 'users', user.uid, MOVIES_COLLECTION, String(movieId)));
      toast({
        variant: 'destructive',
        title: "Removed from Library",
        description: `"${movieToRemove?.title}" has been removed.`
      });
    } catch (error) {
       console.error("Failed to remove movie from Firestore", error);
       toast({
        variant: "destructive",
        title: "Delete Error",
        description: "Could not remove the movie."
       });
    }
  };

  const updateMovie = async (movieId: number, data: Partial<Movie>) => {
    if (!user) throw new Error("User not authenticated.");
    try {
        const docRef = doc(db, 'users', user.uid, MOVIES_COLLECTION, String(movieId));
        await updateDoc(docRef, data);
    } catch (error) {
        console.error("Failed to update movie", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your changes."
        });
    }
  };

  const isMovieAdded = (movieId: number) => movies.some(m => m.id === movieId);
  
  const getMovie = (movieId: number) => movies.find(m => m.id === movieId);

  return (
    <MovieContext.Provider value={{ movies, addMovie, removeMovie, updateMovie, isMovieAdded, getMovie, isLoading, refetch: () => {} }}>
      {children}
    </MovieContext.Provider>
  );
}
