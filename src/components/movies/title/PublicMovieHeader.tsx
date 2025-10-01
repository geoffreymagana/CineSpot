
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Movie } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Star,
  DollarSign,
  Film,
  Pencil,
  PlayCircle,
  PlusCircle,
  CheckCircle,
  Tv,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useMovies } from '@/lib/hooks/use-movies';
import { useToast } from '@/hooks/use-toast';
import { TrailerPlayer } from '../TrailerPlayer';
import { getPosterUrl, getBackdropUrl } from '@/lib/utils';
import { getTitleDetails } from '@/lib/services/tmdb';
import { useState, useEffect } from 'react';
import { FeedbackDialog } from '../FeedbackDialog';
import { useRecommendations } from '@/hooks/use-recommendations';
import { processRecommendationFeedback } from '@/ai/flows/recommendation-feedback-flow';
import { useAuth } from '@/hooks/use-auth';
import { getWatchProviders } from '@/lib/services/tmdb';
import { WhereToWatch } from './WhereToWatch';
import { useUserMovieData } from '@/hooks/use-user-movie-data';

interface PublicMovieHeaderProps {
  movie: Movie;
  children?: React.ReactNode;
}

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

export function PublicMovieHeader({ movie: initialMovie, children }: PublicMovieHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addMovie, isMovieAdded } = useMovies();
  const { toast } = useToast();
  
  const movie = initialMovie;
  const [providers, setProviders] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p = await getWatchProviders(movie.id, movie.media_type || 'movie');
        if (mounted) setProviders(p);
      } catch (e) {
        console.warn('Could not load watch providers', e);
      }
    })();
    return () => { mounted = false };
  }, [movie.id, movie.media_type]);

  const director = movie.credits?.crew.find(c => c.job === 'Director');
  const writer = movie.credits?.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay');

  const handleCollect = async () => {
    if (!user) {
        router.push('/auth/login');
        return;
    }
    if (isMovieAdded(movie.id)) {
      toast({ title: 'Already in library' });
      return;
    }
    try {
      const fullDetails = await getTitleDetails(movie.id, movie.media_type || 'movie');
      await addMovie(fullDetails);
      toast({
        title: "Added to Library!",
        description: `"${movie.title}" is now in your library.`
      });
    } catch(e) {
      console.error("Error collecting title:", e);
      toast({
        variant: 'destructive',
        title: "Error adding title"
      })
    }
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
              <div className="flex flex-col md:flex-row gap-8 pt-8">
                {/* Poster */}
                <div className="w-48 flex-shrink-0 md:w-64 mx-auto md:mx-0">
                  <Image
                    src={getPosterUrl(movie.poster_path)}
                    alt={`Poster for ${movie.title}`}
                    width={500}
                    height={750}
                    className="rounded-lg shadow-2xl shadow-black/50"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-end text-center md:text-left">
                  <h1 className="font-headline text-4xl lg:text-6xl font-extrabold text-foreground">
                    {movie.title}
                  </h1>
                  {movie.tagline && <p className="text-lg text-muted-foreground mt-1 italic">"{movie.tagline}"</p>}
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                    {movie.genres && movie.genres.map(genre => (
                      <Badge key={genre.id} variant="secondary">{genre.name}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                    <TrailerPlayer videos={movie.videos}>
                      <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <PlayCircle className="md:mr-2" />
                          <span className="hidden md:inline">Play Trailer</span>
                      </Button>
                    </TrailerPlayer>
                     {children ? children : (
                         isMovieAdded(movie.id) ? (
                            <Button size="lg" disabled>
                                <CheckCircle className="mr-2" />
                                In Your Library
                            </Button>
                            ) : (
                            <Button size="lg" onClick={handleCollect}>
                                <PlusCircle className="mr-2" />
                                Add to Library
                            </Button>
                        )
                     )}
                  </div>


                  <p className="mt-6 max-w-3xl text-base">{movie.overview}</p>
                  <WhereToWatch providers={providers} />
                </div>
              </div>
          </div>
        </div>
        <div className="relative z-10 container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8 mt-8">
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-x-6 gap-y-6">
                <DetailItem icon={Star} label="Rating" value={`${movie.vote_average.toFixed(1)} / 10`} />
                {movie.runtime ? <DetailItem icon={Clock} label={movie.media_type === 'tv' ? "Episode Runtime" : "Runtime"} value={`${movie.runtime} min`} /> : null }
                {movie.release_date && <DetailItem icon={Calendar} label={movie.media_type === 'tv' ? "First Aired" : "Released"} value={movie.release_date.substring(0,4)} />}
                {director && <DetailItem icon={Pencil} label="Director" value={director.name} />}
                {writer && <DetailItem icon={Pencil} label="Writer" value={writer.name} />}
                {movie.budget && movie.budget > 0 ? <DetailItem icon={DollarSign} label="Budget" value={`$${movie.budget.toLocaleString()}`} /> : null}
                {movie.belongs_to_collection && <DetailItem icon={Film} label="Part of" value={movie.belongs_to_collection.name} />}
                 {movie.number_of_seasons && <DetailItem icon={Tv} label="Seasons" value={movie.number_of_seasons} />}
                {movie.number_of_episodes && <DetailItem icon={Tv} label="Episodes" value={movie.number_of_episodes} />}
            </div>
        </div>
      </div>
    </>
  );
}

// Fetch providers on the client after mount
// (keeps server rendering fast and avoids coupling to user's locale)
PublicMovieHeader.displayName = 'PublicMovieHeader';
