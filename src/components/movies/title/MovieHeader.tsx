
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Movie, Collection } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Globe,
  MoreVertical,
  PlayCircle,
  PlusCircle,
  Star,
  Trash2,
  Bookmark,
  DollarSign,
  Repeat,
  Film,
  Pencil,
  MinusCircle,
  Plus,
  Minus,
  Tv,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddToCollectionPopover } from '@/components/collections/AddToCollectionPopover';
import { WatchStatusSelector } from '../WatchStatusSelector';
import { useMovies } from '@/lib/hooks/use-movies';
import { useCollections } from '@/hooks/use-collections';
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
import { TrailerPlayer } from '../TrailerPlayer';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { Input } from '@/components/ui/input';
import { getPosterUrl } from '@/lib/utils';

interface MovieHeaderProps {
  movie: Movie;
}

const getBackdropUrl = (path: string | null) => {
  return path ? `https://image.tmdb.org/t/p/w1280${path}` : 'https://picsum.photos/seed/backdrop/1280/720';
};

const DetailItem = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
           <Icon className='w-4 h-4' />
           <span>{label}</span>
        </div>
        <div className="text-base font-medium text-foreground">{value}</div>
        {children}
    </div>
)

export function MovieHeader({ movie }: MovieHeaderProps) {
  const router = useRouter();
  const { updateMovie, removeMovie } = useMovies();
  const { collections, addMovieToCollection, getCollectionsForMovie, createCollection } = useCollections();
  const { getUserDataForMovie, updateUserData } = useUserMovieData();
  
  const userData = getUserDataForMovie(movie.id);

  const director = movie.credits?.crew.find(c => c.job === 'Director');
  const writer = movie.credits?.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay');

  const handleDelete = async () => {
    await removeMovie(movie.id);
    router.replace('/');
  }
  
  const handleRatingChange = (newRating: number) => {
    const rating = Math.max(0, Math.min(10, newRating));
    updateUserData(movie.id, { personalRating: rating });
  }

  const handleStatusChange = (status: NonNullable<Movie['watchStatus']>) => {
    updateMovie(movie.id, { watchStatus: status });

    // If marking a TV show as complete, mark all episodes as watched
    if (status === 'Completed' && movie.media_type === 'tv' && movie.seasons) {
        const allEpisodeIds = movie.seasons
            .flatMap(s => s.episodes)
            .map(e => e.id);
        updateUserData(movie.id, { watchedEpisodes: allEpisodeIds });
    }
  }

  const handleCreateCollection = async (newCollection: Partial<Collection>) => {
    const newCollectionId = await createCollection(newCollection as any);
    return newCollectionId;
  };

  return (
    <>
      <div className="relative w-full text-foreground pb-12">
        {/* Backdrop */}
        <div className="absolute inset-0 h-[60vh] md:h-[80vh]">
          <Image
            src={getBackdropUrl(movie.backdrop_path)}
            alt={`Backdrop for ${movie.title}`}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8">
              <div className="mb-8">
                  <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Library
                  </Link>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Poster & Watch Status */}
                <div className="w-48 flex-shrink-0 md:w-64 mx-auto md:mx-0 space-y-4">
                  <Image
                    src={getPosterUrl(movie.poster_path)}
                    alt={`Poster for ${movie.title}`}
                    width={500}
                    height={750}
                    className="rounded-lg shadow-2xl shadow-black/50"
                  />
                  <WatchStatusSelector
                      status={movie.watchStatus}
                      onStatusChange={handleStatusChange}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-end text-center md:text-left">
                  <h1 className="font-headline text-4xl lg:text-6xl font-extrabold">
                    {movie.title}
                  </h1>
                  {movie.tagline && <p className="text-lg text-muted-foreground mt-1 italic">"{movie.tagline}"</p>}
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                    {movie.genres.map(genre => (
                      <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                    <TrailerPlayer videos={movie.videos}>
                      <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                          <PlayCircle className="md:mr-2" />
                          <span className="hidden md:inline">Play Trailer</span>
                      </Button>
                    </TrailerPlayer>
                       <div className="sm:w-auto">
                          <AddToCollectionPopover
                              collections={collections}
                              movieCollections={getCollectionsForMovie(movie.id)}
                              onSelectCollection={(collectionId) => addMovieToCollection(collectionId, movie.id)}
                              onCollectionCreate={handleCreateCollection}
                          />
                      </div>
                       <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="lg" className="px-3 bg-white/10 border-white/20 hover:bg-white/20">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem disabled>
                                   <Pencil className="mr-2 h-4 w-4" />
                                  Edit Title
                              </DropdownMenuItem>
                             <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Title
                              </DropdownMenuItem>
                             </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete "{movie.title}" from your library and all collections.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>

                      </AlertDialog>
                  </div>

                  <p className="mt-6 max-w-3xl text-base">{movie.overview}</p>
                </div>
              </div>
          </div>
        </div>
        <div className="relative z-10 container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-x-6 gap-y-6">
                <DetailItem icon={Star} label="TMDB Rating" value={`${movie.vote_average.toFixed(1)} / 10`} />
                
                <DetailItem icon={Star} label="Your Rating">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleRatingChange((userData?.personalRating || 0) - 1)}><Minus/></Button>
                        <Input type="number" value={userData?.personalRating || ''} onChange={(e) => handleRatingChange(Number(e.target.value))} className="w-16 h-8 text-center bg-secondary" placeholder="-" />
                        <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => handleRatingChange((userData?.personalRating || 0) + 1)}><Plus/></Button>
                    </div>
                </DetailItem>
                
                {movie.runtime ? <DetailItem icon={Clock} label={movie.media_type === 'tv' ? "Episode Runtime" : "Runtime"} value={`${movie.runtime} min`} /> : null }
                <DetailItem icon={Calendar} label={movie.media_type === 'tv' ? "First Aired" : "Released"} value={movie.release_date.substring(0,4)} />
                {director && <DetailItem icon={Pencil} label="Director" value={director.name} />}
                {writer && <DetailItem icon={Pencil} label="Writer" value={writer.name} />}
                {movie.budget && movie.budget > 0 ? <DetailItem icon={DollarSign} label="Budget" value={`$${movie.budget.toLocaleString()}`} /> : null}
                {movie.rewatchCount ? <DetailItem icon={Repeat} label="Rewatches" value={movie.rewatchCount} /> : null}
                {movie.belongs_to_collection && <DetailItem icon={Film} label="Part of" value={movie.belongs_to_collection.name} />}
                {movie.number_of_seasons && <DetailItem icon={Tv} label="Seasons" value={movie.number_of_seasons} />}
                {movie.number_of_episodes && <DetailItem icon={Tv} label="Episodes" value={movie.number_of_episodes} />}
            </div>
        </div>
      </div>
    </>
  );
}
