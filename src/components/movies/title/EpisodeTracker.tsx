
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Movie, Season } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useUserMovieData } from '@/hooks/use-user-movie-data';
import { useMovies } from '@/lib/hooks/use-movies';
import { getSeasonDetails } from '@/ai/flows/get-season-details-flow';
import { Check, Loader2, RefreshCcw } from 'lucide-react';

interface EpisodeTrackerProps {
  movie: Movie;
}

export function EpisodeTracker({ movie }: EpisodeTrackerProps) {
  const { getUserDataForMovie, updateUserData } = useUserMovieData();
  const { updateMovie } = useMovies();
  const [detailedSeasons, setDetailedSeasons] = useState<Season[]>(movie.seasons || []);
  const [isLoading, setIsLoading] = useState(!movie.seasons);

  const userData = getUserDataForMovie(movie.id);
  const watchedEpisodesSet = useMemo(() => new Set(userData?.watchedEpisodes || []), [userData?.watchedEpisodes]);
  
  const fetchDetails = useCallback(async () => {
    if (!movie.seasons || movie.seasons.length === 0 || movie.seasons.some(s => !s.episodes)) {
        if (!movie.number_of_seasons) return;
        setIsLoading(true);
        try {
          const seasonsData = await getSeasonDetails({
            tvId: movie.id,
            numberOfSeasons: movie.number_of_seasons,
          });
          const fullSeasons = seasonsData.seasons;
          setDetailedSeasons(fullSeasons);
          // Also update the movie object in the main context
          updateMovie(movie.id, { seasons: fullSeasons });
        } catch (error) {
          console.error("Failed to fetch season details", error);
        } finally {
          setIsLoading(false);
        }
    }
  }, [movie.id, movie.seasons, movie.number_of_seasons, updateMovie]);
  
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleProgressUpdate = (newWatchedArray: number[]) => {
    updateUserData(movie.id, { watchedEpisodes: newWatchedArray });

    const totalEpisodes = movie.number_of_episodes || 0;
    
    if (newWatchedArray.length === 0) {
      if (movie.watchStatus === 'Completed' || movie.watchStatus === 'Watching') {
        updateMovie(movie.id, { watchStatus: 'Plan to Watch' });
      }
    } else if (totalEpisodes > 0 && newWatchedArray.length === totalEpisodes) {
      if (movie.watchStatus !== 'Completed') {
        updateMovie(movie.id, { watchStatus: 'Completed' });
      }
    } else {
      if (movie.watchStatus !== 'Watching') {
        updateMovie(movie.id, { watchStatus: 'Watching' });
      }
    }
  };
  
  const handleEpisodeToggle = (episodeId: number) => {
    const newWatchedEpisodes = new Set(watchedEpisodesSet);
    if (newWatchedEpisodes.has(episodeId)) {
      newWatchedEpisodes.delete(episodeId);
    } else {
      newWatchedEpisodes.add(episodeId);
    }
    handleProgressUpdate(Array.from(newWatchedEpisodes));
  };

  const handleMarkSeasonComplete = (season: Season) => {
    const seasonEpisodeIds = season.episodes.map(ep => ep.id);
    const newWatchedEpisodes = new Set([...watchedEpisodesSet, ...seasonEpisodeIds]);
    handleProgressUpdate(Array.from(newWatchedEpisodes));
  };
  
  const handleSeasonReset = (season: Season) => {
    const seasonEpisodeIds = new Set(season.episodes.map(ep => ep.id));
    const newWatchedEpisodes = Array.from(watchedEpisodesSet).filter(id => !seasonEpisodeIds.has(id));
    handleProgressUpdate(newWatchedEpisodes);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-card/50 rounded-lg">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span className="text-lg">Loading Episode Data...</span>
      </div>
    );
  }

  const totalWatchedCount = watchedEpisodesSet.size;
  const totalEpisodes = movie.number_of_episodes || 0;
  const overallProgress = totalEpisodes > 0 ? (totalWatchedCount / totalEpisodes) * 100 : 0;

  return (
    <div>
      <h2 className="font-headline text-2xl font-extrabold text-white mb-4">Episode Progress</h2>
      <div className="bg-card/50 p-6 rounded-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-white font-bold">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{totalWatchedCount} / {totalEpisodes} episodes</span>
            </div>
            <Progress value={overallProgress} />
          </div>

          <Accordion type="single" collapsible className="w-full">
          {detailedSeasons.filter(s => s.season_number > 0).map(season => {
             if (!season.episodes) return null;
             const seasonWatchedCount = season.episodes.filter(ep => watchedEpisodesSet.has(ep.id)).length;
             const isSeasonComplete = seasonWatchedCount === season.episodes.length;
            return (
              <AccordionItem value={`season-${season.season_number}`} key={season.id}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full items-center pr-4">
                    <span className="font-bold text-lg">{season.name}</span>
                    <span className="text-sm text-muted-foreground">{seasonWatchedCount} / {season.episodes.length}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-2">
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleMarkSeasonComplete(season)} disabled={isSeasonComplete}>
                            <Check className="mr-2 h-4 w-4" /> Mark as Watched
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSeasonReset(season)}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                    {season.episodes.map(episode => (
                      <div key={episode.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`ep-${episode.id}`}
                          checked={watchedEpisodesSet.has(episode.id)}
                          onCheckedChange={() => handleEpisodeToggle(episode.id)}
                        />
                        <Label htmlFor={`ep-${episode.id}`} className="flex-1 cursor-pointer">
                          <span className="font-semibold">E{episode.episode_number}: {episode.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  );
}
