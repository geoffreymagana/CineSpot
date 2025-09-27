
'use client';
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
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Collection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CreateCollectionDialog } from './CreateCollectionDialog';
import { useState } from 'react';

interface AddToCollectionPopoverProps {
  collections: Collection[];
  movieCollections: string[]; // array of collection IDs
  onSelectCollection: (collectionId: string) => void;
}

export function AddToCollectionPopover({
  collections,
  movieCollections,
  onSelectCollection,
}: AddToCollectionPopoverProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <>
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="lg" className="w-full justify-start bg-white/10 border-white/20 hover:bg-white/20">
           <PlusCircle className="md:mr-2" />
           <span className="hidden md:inline">Add to collection</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[318px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Add to..." />
          <CommandList>
            <CommandEmpty>No collections found.</CommandEmpty>
            <CommandGroup>
              {collections.map(collection => {
                const isAdded = movieCollections.includes(collection.id);
                return (
                  <CommandItem
                    key={collection.id}
                    value={collection.name}
                    onSelect={() => onSelectCollection(collection.id)}
                    className="flex justify-between"
                  >
                    <span>{collection.name}</span>
                     <div className={cn("mr-2 h-4 w-4 rounded-full flex items-center justify-center border border-primary", isAdded ? 'bg-primary' : 'bg-transparent' )}>
                        {isAdded && <Check className="h-3 w-3 text-primary-foreground" />}
                     </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup className="border-t">
                 <CommandItem onSelect={()=> { setPopoverOpen(false); setCreateOpen(true); }} className="text-muted-foreground hover:text-primary aria-selected:text-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create new collection
                 </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <CreateCollectionDialog open={createOpen} onOpenChange={setCreateOpen}>
        <div />
    </CreateCollectionDialog>
    </>
  );
}
