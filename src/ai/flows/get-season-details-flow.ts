
'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching details of all seasons for a TV show.
 *
 * - getSeasonDetails - A function that takes a TV show ID and the number of seasons
 *   and returns detailed information for each season, including episodes.
 * - GetSeasonDetailsInput - The input type for the getSeasonDetails function.
 * - GetSeasonDetailsOutput - The return type for the getSeasonDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SeasonSchema } from '@/lib/types';
import { getSeasonDetails as tmdbGetSeasonDetails } from '@/lib/services/tmdb';

const GetSeasonDetailsInputSchema = z.object({
  tvId: z.number().describe('The TMDB ID of the TV show.'),
  numberOfSeasons: z.number().describe('The total number of seasons the show has.'),
});
export type GetSeasonDetailsInput = z.infer<typeof GetSeasonDetailsInputSchema>;

const GetSeasonDetailsOutputSchema = z.object({
  seasons: z.array(SeasonSchema).describe('A list of seasons with their details, including episodes.'),
});
export type GetSeasonDetailsOutput = z.infer<typeof GetSeasonDetailsOutputSchema>;

export async function getSeasonDetails(
  input: GetSeasonDetailsInput
): Promise<GetSeasonDetailsOutput> {
  return getSeasonDetailsFlow(input);
}

const getSeasonDetailsFlow = ai.defineFlow(
  {
    name: 'getSeasonDetailsFlow',
    inputSchema: GetSeasonDetailsInputSchema,
    outputSchema: GetSeasonDetailsOutputSchema,
  },
  async ({ tvId, numberOfSeasons }) => {
    // Create an array of promises, where each promise is a direct call to the TMDB service.
    const seasonPromises = Array.from({ length: numberOfSeasons }, (_, i) => {
      const seasonNumber = i + 1;
      return tmdbGetSeasonDetails(tvId, seasonNumber);
    });

    // Wait for all the season detail promises to resolve.
    const seasons = await Promise.all(seasonPromises);

    return { seasons };
  }
);
