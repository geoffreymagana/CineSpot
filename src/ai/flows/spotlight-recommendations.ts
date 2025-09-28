
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing movie/show recommendations
 * based on a user's viewing history and collections.
 *
 * - spotlightRecommendations - A function that takes user's viewing history and collections
 *   as input and returns a list of recommended movie/show titles.
 * - SpotlightRecommendationsInput - The input type for the spotlightRecommendations function.
 * - SpotlightRecommendationsOutput - The return type for the spotlightRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the flow
const SpotlightRecommendationsInputSchema = z.object({
  watchedTitles: z
    .string()
    .describe('A comma-separated list of movie or show titles the user has recently watched.'),
  addedTitles: z
    .string()
    .describe('A comma-separated list of movie or show titles the user has recently added to their library.'),
  likedTitles: z.string().describe('A comma-separated list of movie or show titles the user has rated highly.'),
  collectedTitles: z.array(z.string()).optional().describe('An array of movie/show titles that the user already has in their library.')
});

export type SpotlightRecommendationsInput = z.infer<
  typeof SpotlightRecommendationsInputSchema
>;

const RecommendationCarouselSchema = z.object({
  title: z.string().describe('The title of the recommendation carousel (e.g., "Because you watched Blade Runner").'),
  recommendations: z.array(z.string()).describe('A list of 5 recommended movie or show titles for this carousel.')
});


// Define the output schema for the flow
const SpotlightRecommendationsOutputSchema = z.object({
  topPicks: z.array(z.string()).describe('A list of 5 diverse, highly-rated movie or show titles tailored to the user\'s general taste for the main Spotlight carousel.'),
  carousels: z.array(RecommendationCarouselSchema).describe('Up to 3 additional carousels of recommendations based on specific user actions (e.g., watching, adding, or liking a title).')
});

export type SpotlightRecommendationsOutput = z.infer<
  typeof SpotlightRecommendationsOutputSchema
>;

// Exported function to call the flow
export async function spotlightRecommendations(
  input: SpotlightRecommendationsInput
): Promise<SpotlightRecommendationsOutput> {
  return spotlightRecommendationsFlow(input);
}

// Define the prompt
const spotlightRecommendationsPrompt = ai.definePrompt({
  name: 'spotlightRecommendationsPrompt',
  input: {schema: SpotlightRecommendationsInputSchema},
  output: {schema: SpotlightRecommendationsOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a movie and TV show recommendation expert for a platform called Cine-Spot. Your goal is to provide personalized and engaging recommendations. Only return the titles of the movies or shows.

  Here is what I've been up to:
  - Recently Watched: {{{watchedTitles}}}
  - Recently Added: {{{addedTitles}}}
  - Highly Rated (Liked): {{{likedTitles}}}

  Here are the titles of movies/shows already in my library, do not recommend these: {{#if collectedTitles}}{{#each collectedTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}.

  Based on this, generate the following for me:

  1.  **Top Picks**: A list of 5 diverse, must-watch movie or show titles for the main Spotlight banner. These should be tailored to my overall taste profile based on the information provided. Make them exciting and high-quality picks.

  2.  **Personalized Carousels**: Create between 1 and 3 additional carousels. Each carousel should have a clear, specific title like "Because you watched...", "Since you added...", or "Because you liked...". Each carousel should contain exactly 5 movie or show titles relevant to that specific title.

  You must only return the titles of the movies or shows. Do not provide any other data.
    `,
});

// Define the Genkit flow
const spotlightRecommendationsFlow = ai.defineFlow(
  {
    name: 'spotlightRecommendationsFlow',
    inputSchema: SpotlightRecommendationsInputSchema,
    outputSchema: SpotlightRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await spotlightRecommendationsPrompt(input);
    return output!;
  }
);
    
