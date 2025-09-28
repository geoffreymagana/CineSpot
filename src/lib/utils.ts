
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Movie } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPosterUrl = (path: string | null, seed?: string) => {
  if (path) return `https://image.tmdb.org/t/p/w500${path}`;
  const s = seed || 'cinespot-default';
  // Request PNG from Dicebear to avoid SVG/CSP issues when dangerouslyAllowSVG is disabled
  return `https://api.dicebear.com/8.x/thumbs/png?seed=${encodeURIComponent(s)}&scale=90`;
}

export const getBackdropUrl = (path: string | null, seed?: string) => {
  if (path) return `https://image.tmdb.org/t/p/w1280${path}`;
  const s = seed || 'cinespot-backdrop';
  // Request PNG from Dicebear to avoid SVG/CSP issues when dangerouslyAllowSVG is disabled
  return `https://api.dicebear.com/8.x/thumbs/png?seed=${encodeURIComponent(s)}&scale=140`;
};

// A centralized function to normalize both movies and TV shows from TMDB into our Movie type
export const normalizeTitle = (item: any): Movie => {
  const isTv = item.media_type === 'tv' || item.first_air_date !== undefined;
  
  const genres = item.genres || [];
  if (item.original_language && item.original_language !== 'en') {
      if (!genres.some((g: any) => g.name === 'Foreign')) {
          genres.push({ id: 99999, name: 'Foreign' });
      }
  }

  return {
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    release_date: item.release_date || item.first_air_date || '',
    vote_average: item.vote_average || 0,
    runtime: item.runtime ?? item.episode_run_time?.[0] ?? null,
    genres: genres,
    media_type: isTv ? 'tv' : 'movie',
    tagline: item.tagline || null,
    budget: item.budget || null,
    credits: item.credits || null,
    images: item.images || null,
    seasons: item.seasons || [],
    belongs_to_collection: item.belongs_to_collection || null,
    videos: item.videos || null,
    number_of_episodes: item.number_of_episodes || null,
    number_of_seasons: item.number_of_seasons || null,
  };
};
