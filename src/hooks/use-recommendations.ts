
'use client';
import { useContext } from 'react';
import { RecommendationContext } from '@/lib/contexts/RecommendationContext';

// This hook is a simple wrapper around useContext
export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};
