
'use client';
import { useContext } from 'react';
import { CollectionContext } from '@/lib/contexts/CollectionContext';

// This hook is now a simple wrapper around useContext
export const useCollections = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
};
