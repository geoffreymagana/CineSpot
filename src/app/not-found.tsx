import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={<SearchX className="h-16 w-16 text-muted-foreground" />}
          title="404 - Page Not Found"
          description="The page you're looking for doesn't exist or has been moved."
        >
          <Button asChild size="lg">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </EmptyState>
      </main>
    </div>
  );
}
