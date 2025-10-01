
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Collection } from '@/lib/types';
import { Film, MoreVertical, Trash2 } from 'lucide-react';
import { Pin } from 'lucide-react';
import { useMovies } from '@/lib/hooks/use-movies';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCollections } from '@/hooks/use-collections';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { getBackdropUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { movies } = useMovies();
  const { deleteCollection } = useCollections();
  const router = useRouter();
  const movieCount = collection.movieIds.length;
  const firstMovieId = collection.movieIds[0];
  const firstMovie = movies.find(m => m.id === firstMovieId);

  // Use PNG variant of Dicebear to avoid SVG being blocked when dangerouslyAllowSVG is disabled
  const imageUrl = collection.coverImageUrl || 
                   (firstMovie ? getBackdropUrl(firstMovie.backdrop_path) : `https://api.dicebear.com/8.x/shapes/png?seed=${collection.id}`);
  
  const imageHint = firstMovie?.title ? firstMovie.title.split(" ").slice(0,2).join(" ") : "movie collection";

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCollection(collection.id);
  }

  const { togglePin } = useCollections();
  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await togglePin(collection.id);
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  }

  return (
    <Link href={`/collections/${collection.id}`} className="group relative">
      <Card className="overflow-hidden border-border bg-card transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20 h-full flex flex-col">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full bg-secondary">
            <Image
              src={imageUrl}
              alt={`${collection.name} collection cover`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              data-ai-hint={imageHint}
            />
          </div>
        </CardContent>
        <div className="flex-1 flex flex-col p-4">
            <CardHeader className="p-0">
              <h3 className="font-headline text-lg font-extrabold text-foreground truncate group-hover:text-primary">
                {collection.name}
              </h3>
               <p className="text-sm text-muted-foreground line-clamp-2 h-[40px] flex-grow">
                {collection.description}
              </p>
            </CardHeader>
            <CardFooter className="p-0 pt-4 text-sm text-muted-foreground flex justify-start items-end mt-auto">
               <div className="flex items-center gap-2 text-foreground">
                <Film className="h-4 w-4"/>
                <span>{movieCount} {movieCount === 1 ? 'title' : 'titles'}</span>
               </div>
            </CardFooter>
        </div>
      </Card>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <Button variant={collection.pinned ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={handleTogglePin}>
            <Pin className="h-4 w-4" />
            <span className="sr-only">{collection.pinned ? 'Unpin collection' : 'Pin collection'}</span>
          </Button>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={e => {e.preventDefault(); e.stopPropagation()}}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Collection
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>

             <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the "{collection.name}" collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </div>
    </Link>
  );
}
