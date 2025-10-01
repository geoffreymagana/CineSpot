
'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, PlusCircle } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandList,
} from '@/components/ui/command';
import type { Collection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCollectionDialog } from './CreateCollectionDialog';

interface AddToCollectionPopoverProps {
  collections: Collection[];
  movieCollections: string[]; // array of collection IDs
  onSelectCollection: (collectionId: string) => void;
  onCollectionCreate: (newCollection: Partial<Collection>) => Promise<string | undefined>;
}

export function AddToCollectionPopover({
  collections,
  movieCollections,
  onSelectCollection,
  onCollectionCreate,
}: AddToCollectionPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections;
    return collections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [collections, searchQuery]);

  const handleOpenCreateDialog = () => {
    setOpen(false); // Close popover before opening dialog
    setCreateDialogOpen(true);
  };
  
  const handleSelectCollection = (collectionId: string) => {
    onSelectCollection(collectionId);
    // Keep popover open for multiple additions/removals
  }
  
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="lg" className="w-full justify-start bg-white/10 border-white/20 hover:bg-white/20">
            <PlusCircle className="md:mr-2" />
            <span className="hidden md:inline">Add to collection</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[318px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Add to..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
            <CommandList>
              <CommandGroup>
                {filteredCollections.length === 0 && searchQuery ? (
                  <div className="py-2 px-3 text-sm text-center text-muted-foreground">
                    No collection named "{searchQuery}".
                    <Button variant="link" className="p-0 h-auto" onClick={handleOpenCreateDialog}>Create it?</Button>
                  </div>
                ) : filteredCollections.length === 0 ? (
                  <div className="py-6 text-center text-sm">No collections found.</div>
                ) : (
                  filteredCollections.map(collection => {
                    const isAdded = movieCollections.includes(collection.id);
                    return (
                       <Button
                        key={collection.id}
                        variant="ghost"
                        className="w-full justify-between px-2 group"
                        onClick={() => handleSelectCollection(collection.id)}
                      >
                        <span className="group-hover:text-white">{collection.name}</span>
                        <div className={cn("mr-2 h-4 w-4 rounded-full flex items-center justify-center border border-primary group-hover:border-white", isAdded ? 'bg-primary group-hover:bg-white' : 'bg-transparent' )}>
                            {isAdded && <Check className="h-3 w-3 text-primary-foreground group-hover:text-primary" />}
                        </div>
                      </Button>
                    );
                  })
                )}
              </CommandGroup>
              <CommandGroup className="border-t">
                  <Button variant="ghost" className="w-full justify-start px-2 text-muted-foreground hover:text-white" onClick={handleOpenCreateDialog}>
                       <PlusCircle className="mr-2 h-4 w-4" />
                       Create new collection
                  </Button>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CreateCollectionDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
        initialName={searchQuery} 
        onCollectionCreated={async (newId) => {
          if (newId) {
            onSelectCollection(newId);
          }
          setSearchQuery('');
        }}
      />
    </>
  );
}
