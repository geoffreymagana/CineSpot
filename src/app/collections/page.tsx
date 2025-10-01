
'use client';

import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { FolderKanban, Loader2, PlusCircle } from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';
import { CreateCollectionDialog } from '@/components/collections/CreateCollectionDialog';
import { CollectionGrid } from '@/components/collections/CollectionGrid';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function CollectionsPage() {
  useAuthGuard();
  const { collections, isLoading } = useCollections();
  const { updateCollection } = useCollections();

  // split pinned and non-pinned
  const pinned = collections.filter(c => c.pinned).sort((a,b) => (a.pinnedIndex ?? 0) - (b.pinnedIndex ?? 0));
  const others = collections.filter(c => !c.pinned);

  // Drag & drop state for pinned strip
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDropOnPinned = async (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('text/plain');
    const fromIdx = Number(raw);
    if (Number.isNaN(fromIdx)) return;
    const reordered = [...pinned];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    // Persist new pinnedIndex values
    for (let i = 0; i < reordered.length; i++) {
      const col = reordered[i];
      if ((col.pinnedIndex ?? -1) !== i) {
        await updateCollection(col.id, { pinnedIndex: i });
      }
    }
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">
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
            <>
              {pinned.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Pinned Collections</h2>
                  <div className="flex gap-4 overflow-x-auto py-2" onDragOver={allowDrop}>
                    {pinned.map((col, idx) => (
                      <div key={col.id} draggable onDragStart={(e) => handleDragStart(e, idx)} onDrop={(e) => handleDropOnPinned(e, idx)} className="min-w-[260px]">
                        <CollectionCard collection={col} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">All Collections</h2>
                <CollectionGrid collections={others} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
