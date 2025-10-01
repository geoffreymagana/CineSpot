
'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Collection } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection as firestoreCollection, getDocs, doc, setDoc, deleteDoc, updateDoc, writeBatch, onSnapshot, collectionGroup, query } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

const COLLECTIONS_COLLECTION = 'collections';

function generateId() {
  return doc(firestoreCollection(db, 'temp')).id;
}

interface CollectionContextType {
  collections: Collection[];
  isLoading: boolean;
  createCollection: (data: { name: string; description?: string; coverImageUrl?: string }) => Promise<string | undefined>;
  updateCollection: (collectionId: string, data: Partial<Omit<Collection, 'id'>>) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  addMovieToCollection: (collectionId: string, movieId: number) => void;
  getCollectionsForMovie: (movieId: number) => string[];
  refetch: () => void;
  togglePin: (collectionId: string) => Promise<void>;
}

export const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) {
      setCollections([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const collectionsRef = firestoreCollection(db, 'users', user.uid, COLLECTIONS_COLLECTION);
    
    const unsubscribe = onSnapshot(collectionsRef,
      async (querySnapshot) => {
        if (querySnapshot.empty) {
            const defaultCollections: Omit<Collection, 'id'>[] = [
              { name: 'My Favorites', movieIds: [], description: 'My all-time favorite movies and shows.' },
              { name: 'Watchlist', movieIds: [], description: 'Titles I want to watch soon.' },
            ];
            
            try {
              const batch = writeBatch(db);
              defaultCollections.forEach(c => {
                  const docRef = doc(collectionsRef);
                  batch.set(docRef, { name: c.name, movieIds: c.movieIds, description: c.description });
              });
              await batch.commit();
            } catch(e) {
                console.error("Failed to create default collections", e);
            }
        } else {
            const collectionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
            setCollections(collectionsData);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to fetch collections from Firestore", error);
        toast({
          variant: "destructive",
          title: "Loading Error",
          description: "Could not sync your collections."
        });
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user, toast]);


  const createCollection = async (data: {name: string; description?: string; coverImageUrl?: string }) => {
    if (!user) throw new Error("User not authenticated.");
    
    const newId = generateId();
    const newCollection: Collection = {
      id: newId,
      name: data.name,
      description: data.description,
      coverImageUrl: data.coverImageUrl,
      movieIds: [],
    };
    
    try {
      await setDoc(doc(db, 'users', user.uid, COLLECTIONS_COLLECTION, newId), {
          name: newCollection.name,
          description: newCollection.description || '',
          coverImageUrl: newCollection.coverImageUrl || null,
          movieIds: newCollection.movieIds,
      });
      return newId;
    } catch (error) {
        console.error("Failed to create collection", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "Could not create the collection."
        });
        throw error;
    }
  };

  const updateCollection = async (collectionId: string, data: Partial<Omit<Collection, 'id'>>) => {
    if (!user) throw new Error("User not authenticated.");
    
    try {
      const docRef = doc(db, 'users', user.uid, COLLECTIONS_COLLECTION, collectionId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Failed to update collection", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your changes."
      });
      throw error;
    }
  }

  const deleteCollection = async (collectionId: string) => {
    if (!user) throw new Error("User not authenticated.");

    try {
        await deleteDoc(doc(db, 'users', user.uid, COLLECTIONS_COLLECTION, collectionId));
    } catch (error) {
        console.error("Failed to delete collection", error);
        toast({
            variant: "destructive",
            title: "Delete Failed",
            description: "Could not delete the collection."
        });
        throw error;
    }
  }

  const togglePin = async (collectionId: string) => {
    if (!user) throw new Error('User not authenticated.');
    const current = collections.find(c => c.id === collectionId);
    if (!current) return;

    const pinnedCount = collections.filter(c => c.pinned).length;
    const newPinned = !current.pinned;

    // If trying to pin and already at limit, show toast and abort
    if (newPinned && pinnedCount >= 3) {
      toast({ variant: 'destructive', title: 'Pin Limit', description: 'You can pin up to 3 collections.' });
      return;
    }

    try {
      await updateCollection(collectionId, { pinned: newPinned });
    } catch (e) {
      // updateCollection will already show an error toast
    }
  }

  const addMovieToCollection = (collectionId: string, movieId: number) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    let updatedMovieIds;
    let isAdding;
    if (collection.movieIds.includes(movieId)) {
        updatedMovieIds = collection.movieIds.filter(id => id !== movieId);
        isAdding = false;
    } else {
        updatedMovieIds = [...collection.movieIds, movieId];
        isAdding = true;
    }
    
    updateCollection(collectionId, { movieIds: updatedMovieIds })
      .then(() => {
        toast({
          title: isAdding ? 'Added to Collection' : 'Removed from Collection',
          description: `Successfully updated "${collection.name}".`
        })
      })
      .catch(() => {
        // Error toast is handled in updateCollection
      });
  };
  
  const getCollectionsForMovie = (movieId: number): string[] => {
    return collections.filter(c => c.movieIds.includes(movieId)).map(c => c.id);
  }

  return (
    <CollectionContext.Provider value={{ collections, isLoading, createCollection, updateCollection, deleteCollection, addMovieToCollection, getCollectionsForMovie, refetch: () => {}, togglePin }}>
      {children}
    </CollectionContext.Provider>
  );
}
