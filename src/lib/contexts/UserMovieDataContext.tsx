
'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { UserLibrary, UserMovieData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';


const USER_DATA_DOC_ID = 'metadata'; 
const USER_DATA_COLLECTION = 'user_data';

interface UserMovieDataContextType {
  userLibrary: UserLibrary;
  isLoading: boolean;
  updateUserData: (movieId: number, data: Partial<UserMovieData>) => Promise<void>;
  getUserDataForMovie: (movieId: number) => UserMovieData | undefined;
}

export const UserMovieDataContext = createContext<UserMovieDataContextType | undefined>(undefined);

export function UserMovieDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userLibrary, setUserLibrary] = useState<UserLibrary>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
        setUserLibrary({});
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const docRef = doc(db, 'users', user.uid, USER_DATA_COLLECTION, USER_DATA_DOC_ID);

    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const firestoreData = docSnap.data() as UserLibrary;
          setUserLibrary(firestoreData);
        } else {
           // If it doesn't exist, it will be created on first updateUserData call.
           setUserLibrary({});
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to fetch user library from Firestore", error);
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "Could not sync your personal movie data."
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const updateUserData = async (movieId: number, data: Partial<UserMovieData>) => {
    if (!user) throw new Error("User not authenticated.");
    
    // Optimistic update
    const updatedLibrary = {
      ...userLibrary,
      [movieId]: {
        ...userLibrary[movieId],
        ...data,
      },
    };
    setUserLibrary(updatedLibrary);

    // Sync with Firestore
    try {
      const docRef = doc(db, 'users', user.uid, USER_DATA_COLLECTION, USER_DATA_DOC_ID);
      await setDoc(docRef, { [movieId]: data }, { merge: true });
    } catch (error) {
      console.error("Failed to update user data in Firestore", error);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not save your changes."
      });
      // No revert for this as it's not critical path and can self-heal on next load
    }
  };

  const getUserDataForMovie = (movieId: number): UserMovieData | undefined => {
    return userLibrary[movieId];
  };

  return (
    <UserMovieDataContext.Provider value={{ userLibrary, isLoading, updateUserData, getUserDataForMovie }}>
      {children}
    </UserMovieDataContext.Provider>
  );
}
