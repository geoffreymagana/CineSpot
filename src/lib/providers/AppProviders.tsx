
'use client';

import { MovieProvider } from '@/lib/contexts/MovieContext';
import { CollectionProvider } from '@/lib/contexts/CollectionContext';
import { RecommendationProvider } from '@/lib/contexts/RecommendationContext';
import { UserMovieDataProvider } from '@/lib/contexts/UserMovieDataContext';
import { AuthProvider } from '../contexts/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MovieProvider>
        <CollectionProvider>
          <UserMovieDataProvider>
              <RecommendationProvider>
                  {children}
              </RecommendationProvider>
          </UserMovieDataProvider>
        </CollectionProvider>
      </MovieProvider>
    </AuthProvider>
  );
}
