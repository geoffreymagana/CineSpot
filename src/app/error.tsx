'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { ServerCrash } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={<ServerCrash className="h-16 w-16 text-destructive" />}
          title="Something went wrong!"
          description="An unexpected error occurred. Please try again."
        >
          <Button onClick={() => reset()} size="lg">
            Try Again
          </Button>
        </EmptyState>
      </main>
    </div>
  );
}
