
import type { Movie, Season } from '@/lib/types';
import { normalizeTitle } from '@/lib/utils';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const API_BASE_URL = 'https://api.themoviedb.org/3';

const apiFetch = async (path: string, params: Record<string, string> = {}) => {
    if (!API_KEY) {
        throw new Error('TMDB API key is missing. Please add NEXT_PUBLIC_TMDB_API_KEY to your environment variables.');
    }
    const url = new URL(`${API_BASE_URL}${path}`);
    url.searchParams.append('api_key', API_KEY);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    let response: Response;
    try {
        response = await fetch(url.toString());
    } catch (err: any) {
        // Network-level failure (DNS, connectivity, TLS)
        throw new Error(`TMDB fetch failed for ${url.toString()}: ${err?.message || String(err)}`);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ status_message: response.statusText }));
        throw new Error(`TMDB API error: ${errorData.status_message || 'Unknown error'}`);
    }
    return response.json();
}

export const findTitleById = async (id: number) => {
    const data = await apiFetch(`/find/${id}`, { external_source: 'imdb_id' });
    const result = [...data.movie_results, ...data.tv_results][0];
    if (result) {
        return getTitleDetails(result.id, result.media_type);
    }
    return null;
}


export const searchMovies = async (query: string, limit?: number): Promise<Movie[]> => {
    const data = await apiFetch('/search/multi', { query });
    const results = data.results
      .filter((m: any) => (m.media_type === 'movie' || m.media_type === 'tv') && m.poster_path)
      .map(normalizeTitle);
    
    if (limit) {
        return results.slice(0, limit);
    }
    return results;
};

export const getTitleDetails = async (titleId: number, mediaType?: 'movie' | 'tv' | null): Promise<Movie> => {
    const appendToResponse = 'credits,images,videos,external_ids';
    let type = mediaType;

    if (!type) {
         try {
            const movieData = await apiFetch(`/movie/${titleId}`, { append_to_response: appendToResponse });
            return normalizeTitle(movieData);
        } catch (e) {
            // If movie fails, assume it's a TV show
             const tvData = await apiFetch(`/tv/${titleId}`, { append_to_response: appendToResponse });
             return normalizeTitle(tvData);
        }
    }
    
    const data = await apiFetch(`/${type}/${titleId}`, { append_to_response: appendToResponse });
    return normalizeTitle(data);
}

export const getWatchProviders = async (titleId: number, mediaType: 'movie' | 'tv', country = 'US') => {
    try {
        const data = await apiFetch(`/${mediaType}/${titleId}/watch/providers`);
        const providers = data.results && data.results[country] ? data.results[country] : null;
        return providers as any || null;
    } catch (e) {
        console.warn('Failed to fetch watch providers for', titleId, e);
        return null;
    }
}

export const getTrendingMovies = async (): Promise<Movie[]> => {
    const data = await apiFetch('/trending/all/week');
    return data.results
        .filter((m: any) => (m.media_type === 'movie' || m.media_type === 'tv') && m.poster_path)
        .map(normalizeTitle);
}

export const getRecommendationsForTitle = async (titleId: number, mediaType: 'movie' | 'tv') => {
    try {
        const path = `/${mediaType}/${titleId}/recommendations`;
        const data = await apiFetch(path);
        return (data.results || []).filter((m: any) => (m.media_type === 'movie' || m.media_type === 'tv')).map(normalizeTitle);
    } catch (e) {
        console.warn('Failed to fetch recommendations for title', titleId, e);
        return [];
    }
}

export const getTopRatedMovies = async (): Promise<Movie[]> => {
    const data = await apiFetch('/movie/top_rated');
     return data.results.map(normalizeTitle);
}

export const getUpcomingMovies = async (): Promise<Movie[]> => {
    const data = await apiFetch('/movie/upcoming');
     return data.results.map(normalizeTitle);
}

export const getSeasonDetails = async (tvId: number, seasonNumber: number): Promise<Season> => {
    const data = await apiFetch(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
};
