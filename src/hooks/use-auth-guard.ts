
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './use-auth';

export const useAuthGuard = (redirectTo = '/auth/login') => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/public') && !pathname.startsWith('/auth')) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, pathname]);
};

export const useRedirectIfAuthenticated = (redirectTo = '/') => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Only redirect if on an auth page
            if (window.location.pathname.startsWith('/auth')) {
                router.push(redirectTo);
            }
        }
    }, [user, loading, router, redirectTo]);
}
