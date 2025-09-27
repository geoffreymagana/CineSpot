
'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay"
import { ThumbsUp, ThumbsDown, PlusCircle, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMovies } from '@/lib/hooks/use-movies';
import type { Movie } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getBackdropUrl } from '@/lib/utils';

interface RecommendationCarouselProps {
  movies: (Movie & { publicLink: string })[];
  onCollect: (movie: Movie) => void;
  onFeedback: (movie: Movie, liked: boolean) => void;
}

export function RecommendationCarousel({
  movies,
  onCollect,
  onFeedback,
}: RecommendationCarouselProps) {
  const { isMovieAdded } = useMovies();
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {movies.map(movie => (
          <CarouselItem key={movie.id}>
            <div className="relative min-w-0 flex-shrink-0 flex-grow-0 basis-full">
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

                <div className="relative z-10 flex h-[60vh] md:h-[80vh] flex-col justify-end">
                <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:px-6 lg:px-8">
                    <div className="max-w-2xl text-center md:text-left">
                    <h1 className="font-headline text-4xl lg:text-6xl font-extrabold text-white">
                        {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                        {movie.release_date && <Badge variant="outline" className="border-white/20 bg-black/20 text-white">{movie.release_date.substring(0,4)}</Badge>}
                        <Badge variant="outline" className="border-white/20 bg-black/20 text-white">{movie.vote_average.toFixed(1)} Rating</Badge>
                        {movie.genres && movie.genres[0] && <Badge variant="outline" className="border-white/20 bg-black/20 text-white">{movie.genres[0].name}</Badge>}
                    </div>
                    <p className="mt-4 text-base text-muted-foreground line-clamp-3">
                        {movie.overview}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                        <Link href={movie.publicLink}>
                        <Button size="lg" variant="secondary">
                            <Info className="mr-2" />
                            More Info
                        </Button>
                        </Link>
                        {isMovieAdded(movie.id) ? (
                        <Button size="lg" disabled>
                            <CheckCircle className="mr-2" />
                            Collected
                        </Button>
                        ) : (
                        <Button size="lg" onClick={() => onCollect(movie)}>
                            <PlusCircle className="mr-2" />
                            Collect
                        </Button>
                        )}
                        <div className="flex gap-2">
                            <Button size="lg" variant="outline" className="bg-transparent border-white/20 hover:bg-white/10" onClick={() => onFeedback(movie, true)}>
                                <ThumbsUp />
                            </Button>
                            <Button size="lg" variant="outline" className="bg-transparent border-white/20 hover:bg-white/10" onClick={() => onFeedback(movie, false)}>
                                <ThumbsDown />
                            </Button>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex text-white bg-black/20 border-white/20 hover:bg-white/20"/>
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex text-white bg-black/20 border-white/20 hover:bg-white/20"/>
    </Carousel>
  );
}
