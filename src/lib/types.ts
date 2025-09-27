
'use client';
import { z } from 'zod';

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const CreditsSchema = z.object({
  cast: z.array(z.object({
    id: z.number(),
    name: z.string(),
    character: z.string(),
    profile_path: z.string().nullable(),
  })),
  crew: z.array(z.object({
    id: z.number(),
    name: z.string(),
    job: z.string(),
  })),
});

const ImagesSchema = z.object({
  backdrops: z.array(z.object({ file_path: z.string() })),
  posters: z.array(z.object({ file_path: z.string() })),
});

const BelongsToCollectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  poster_path: z.string(),
  backdrop_path: z.string(),
}).nullable();

const VideosSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    site: z.enum(['YouTube']),
    type: z.enum(['Trailer', 'Teaser', 'Clip', 'Featurette', 'Behind the Scenes', 'Bloopers']),
  })),
});

const WatchStatusSchema = z.enum(['Plan to Watch', 'Watching', 'Completed', 'On Hold', 'Dropped']);

export const EpisodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  episode_number: z.number(),
  air_date: z.string().nullable(),
});

export const SeasonSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    season_number: z.number(),
    air_date: z.string().nullable(),
    poster_path: z.string().nullable(),
    episodes: z.array(EpisodeSchema),
});


// Base movie schema for AI flow output and other strict contexts
export const BaseMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  overview: z.string(),
  release_date: z.string(),
  vote_average: z.number(),
  runtime: z.number().nullable(),
  genres: z.array(GenreSchema),
  media_type: z.enum(['movie', 'tv']).optional(),
  tagline: z.string().optional().nullable(),
  budget: z.number().optional(),
  credits: CreditsSchema.optional(),
  images: ImagesSchema.optional(),
  seasons: z.array(SeasonSchema).optional(),
  belongs_to_collection: BelongsToCollectionSchema.optional(),
  videos: VideosSchema.optional(),
  watchStatus: WatchStatusSchema.optional(),
  rewatchCount: z.number().optional(),
  number_of_episodes: z.number().optional(),
  number_of_seasons: z.number().optional(),
});

// Optional version for general use where the whole object might be missing
export const MovieSchema = BaseMovieSchema.optional();


export type Movie = z.infer<typeof BaseMovieSchema>;
export type Season = z.infer<typeof SeasonSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;


export interface Collection {
  id: string;
  name: string;
  movieIds: number[];
  description?: string;
  coverImageUrl?: string;
}

export type UserMovieData = {
    personalRating?: number;
    watchedEpisodes?: number[];
}

export type UserLibrary = {
    [movieId: number]: UserMovieData;
}
