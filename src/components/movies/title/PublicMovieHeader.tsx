
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
import { useState } from 'react';
import { FeedbackDialog } from '../FeedbackDialog';
import { useRecommendations } from '@/hooks/use-recommendations';
import { processRecommendationFeedback } from '@/ai/flows/recommendation-feedback-flow';

interface PublicMovieHeaderProps {
  movie: Movie;
}

const DetailItem = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
           <Icon className='w-4 h-4' />
           <span>{label}</span>
        </div>
        <div className="text-base font-medium text-white">{value}</div>
        {children}
    </div>
)

export function PublicMovieHeader({ movie: initialMovie }: PublicMovieHeaderProps) {
  const router = useRouter();
  const { addMovie, isMovieAdded } = useMovies();
  const { removeRecommendation } = useRecommendations();
  const { toast } = useToast();
  
  const movie = initialMovie;
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const director = movie.credits?.crew.find(c => c.job === 'Director');
  const writer = movie.credits?.crew.find(c => c.job === 'Writer' || c.job === 'Screenplay');

  const handleAddToLibrary = async () => {
    try {
        const fullDetails = await getTitleDetails(movie.id, movie.media_type || 'movie');
        await addMovie(fullDetails);
        toast({
          title: "Added to Library!",
          description: `"${movie.title}" is now in your library.`
        });
        router.push(`/title/${movie.id}`);
    } catch(e) {
        console.error("Failed to add title to library", e);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Could not add this title to your library."
        });
    }
  }
  
  const handleFeedback = async (liked: boolean, reason?: string) => {
    setFeedbackGiven(true);
    removeRecommendation(movie.id);

    try {
        const result = await processRecommendationFeedback({
            title: movie.title,
            liked,
            reason
        });

        toast({
            title: "Feedback Received",
            description: result.confirmationMessage,
        });

    } catch (e) {
        console.error("Failed to process feedback", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not submit your feedback.",
        });
    }
  }

  return (
    <>
      <div className="relative w-full text-white pb-12">
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
                  <Link href="/spotlight" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Spotlight
                  </Link>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
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
                  <h1 className="font-headline text-4xl lg:text-6xl font-extrabold">
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
                      <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                          <PlayCircle className="md:mr-2" />
                          <span className="hidden md:inline">Play Trailer</span>
                      </Button>
                    </TrailerPlayer>
                     {isMovieAdded(movie.id) ? (
                        <Button size="lg" variant="secondary" onClick={() => router.push(`/title/${movie.id}`)}>
                          <CheckCircle className="mr-2" />
                          In Your Library
                        </Button>
                     ) : (
                        <Button size="lg" onClick={handleAddToLibrary}>
                            <PlusCircle className="mr-2" />
                            Add to Library
                        </Button>
                     )}
                     <div className="flex gap-2">
                        <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" onClick={() => handleFeedback(true)} disabled={feedbackGiven}>
                            <ThumbsUp />
                        </Button>
                        <FeedbackDialog
                            open={isFeedbackDialogOpen}
                            onOpenChange={setIsFeedbackDialogOpen}
                            onSubmit={(reason) => handleFeedback(false, reason)}
                            title={movie.title}
                        >
                            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" disabled={feedbackGiven}>
                                <ThumbsDown />
                            </Button>
                        </FeedbackDialog>
                     </div>
                  </div>
                  {feedbackGiven && <p className="text-sm mt-2 text-muted-foreground">Thank you for your feedback!</p>}


                  <p className="mt-6 max-w-3xl text-base">{movie.overview}</p>
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
