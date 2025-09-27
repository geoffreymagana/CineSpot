
'use client';

import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { FolderKanban, Loader2, PlusCircle } from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import { CollectionGrid } from '@/components/collections/CollectionGrid';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function CollectionsPage() {
  useAuthGuard();
  const { collections, isLoading } = useCollections();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-white">
              Collections
            </h1>
            <CreateCollectionDialog>
              <Button>
                <PlusCircle className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Create Collection</span>
              </Button>
            </CreateCollectionDialog>
          </div>
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin" />
             </div>
          ) : collections.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="h-16 w-16 text-muted-foreground" />}
              title="No Collections Yet"
              description="Create collections to organize your movies and shows."
            >
              <CreateCollectionDialog>
                <Button size="lg">Create Your First Collection</Button>
              </CreateCollectionDialog>
            </EmptyState>
          ) : (
            <CollectionGrid collections={collections} />
          )}
        </div>
      </main>
    </div>
  );
}
