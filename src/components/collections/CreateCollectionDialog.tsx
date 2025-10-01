
'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollections } from '@/hooks/use-collections';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateCollectionDialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialName?: string;
    onCollectionCreated?: (newCollectionId: string | undefined) => void;
}

export function CreateCollectionDialog({ children, open, onOpenChange, initialName = '', onCollectionCreated }: CreateCollectionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createCollection } = useCollections();
  const { toast } = useToast();
  
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setCurrentOpen = isControlled ? onOpenChange : setInternalOpen;

  const handleCreate = async () => {
    if (name.trim().length < 2) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Collection name must be at least 2 characters long.',
      });
      return;
    }
    
    setIsCreating(true);
    try {
        const newCollectionId = await createCollection({name, description});
        toast({
          title: 'Collection Created',
          description: `"${name}" has been created successfully.`,
        });
        setCurrentOpen(false);
        if (onCollectionCreated) {
          onCollectionCreated(newCollectionId);
        }
    } catch (error) {
        console.error("Failed to create collection", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "Could not create the collection. Please try again."
        })
    } finally {
        setIsCreating(false);
    }
  };

  useEffect(() => {
    if (currentOpen) {
      setName(initialName);
      setDescription('');
    }
  }, [currentOpen, initialName]);

  return (
    <Dialog open={currentOpen} onOpenChange={setCurrentOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Create New Collection</DialogTitle>
          <DialogDescription>
            Organize your titles into a new collection. Give it a name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., All-Time Favorites"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description for your collection..."
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
