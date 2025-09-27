
'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
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
import { useMovies } from '@/lib/hooks/use-movies';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Collection, Movie } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { getPosterUrl } from '@/lib/utils';


function ManageTitlesTab({
    selectedMovieIds,
    setSelectedMovieIds
} : {
    selectedMovieIds: number[],
    setSelectedMovieIds: React.Dispatch<React.SetStateAction<number[]>>
}) {
    const { movies, isLoading } = useMovies();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMovies = useMemo(() => {
        return movies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [movies, searchQuery]);

    const handleSelectMovie = (movieId: number, checked: boolean) => {
        setSelectedMovieIds(prev => {
            if (checked) {
                return [...prev, movieId];
            } else {
                return prev.filter(id => id !== movieId);
            }
        });
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search your library..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <p className="text-sm text-muted-foreground">Select titles from your library to include in this collection.</p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-4">
                {filteredMovies.map(movie => (
                    <div key={movie.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary">
                        <Checkbox
                            id={`movie-${movie.id}`}
                            checked={selectedMovieIds.includes(movie.id)}
                            onCheckedChange={(checked) => handleSelectMovie(movie.id, !!checked)}
                        />
                        <Label htmlFor={`movie-${movie.id}`} className="flex-1 flex items-center gap-4 cursor-pointer">
                            <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} width={40} height={60} className="rounded-md object-cover" />
                            <div className="flex-1">
                                <p className="font-semibold">{movie.title}</p>
                                <p className="text-sm text-muted-foreground">{movie.release_date.substring(0,4)}</p>
                            </div>
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DetailsTab({
    name,
    setName,
    description,
    setDescription,
} : {
    name: string,
    setName: (name: string) => void,
    description: string,
    setDescription: (desc: string) => void
}) {
    return (
        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
             <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., All-Time Favorites"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description for your collection..."
                />
            </div>
        </div>
    );
}


export function EditCollectionDialog({ collection, children, openOnTrigger = false }: { collection: Collection, children: React.ReactNode, openOnTrigger?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description || '');
  const [selectedMovieIds, setSelectedMovieIds] = useState(collection.movieIds);
  const [isSaving, setIsSaving] = useState(false);
  
  const { updateCollection } = useCollections();
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
        await updateCollection(collection.id, {
            name,
            description,
            movieIds: selectedMovieIds,
        });
        toast({
            title: "Changes Saved",
            description: `Successfully updated "${name}".`
        })
        setOpen(false);
    } catch (error) {
        console.error("Failed to save changes", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your changes. Please try again."
        })
    } finally {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    if (open) {
      setName(collection.name);
      setDescription(collection.description || '');
      setSelectedMovieIds(collection.movieIds);
    }
  }, [open, collection]);
  
   useEffect(() => {
    if (openOnTrigger) {
      setOpen(true);
    }
  }, [openOnTrigger]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit: {collection.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="manage">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Manage Titles</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="manage" className="py-4">
               <ManageTitlesTab 
                 selectedMovieIds={selectedMovieIds}
                 setSelectedMovieIds={setSelectedMovieIds}
                />
            </TabsContent>
            <TabsContent value="details" className="py-4">
                <DetailsTab
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                />
            </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
