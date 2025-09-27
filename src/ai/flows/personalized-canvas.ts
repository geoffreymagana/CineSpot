'use server';

/**
 * @fileOverview Personalized canvas flow to generate image prompts based on user's movie preferences.
 *
 * - generatePersonalizedPrompt - A function that generates a personalized image prompt.
 * - PersonalizedPromptInput - The input type for the generatePersonalizedPrompt function.
 * - PersonalizedPromptOutput - The return type for the generatePersonalizedPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedPromptInputSchema = z.object({
  movieTitles: z
    .array(z.string())
    .describe('A list of movie titles that the user loves.'),
  basePrompt: z
    .string()
    .describe('The base prompt to be personalized for image generation.'),
});
export type PersonalizedPromptInput = z.infer<typeof PersonalizedPromptInputSchema>;

const PersonalizedPromptOutputSchema = z.object({
  personalizedPrompt: z
    .string()
    .describe(
      'A personalized image generation prompt that incorporates the style from the user-provided movies.'
    ),
});
export type PersonalizedPromptOutput = z.infer<typeof PersonalizedPromptOutputSchema>;

export async function generatePersonalizedPrompt(
  input: PersonalizedPromptInput
): Promise<PersonalizedPromptOutput> {
  return personalizedCanvasFlow(input);
}

const personalizedCanvasPrompt = ai.definePrompt({
  name: 'personalizedCanvasPrompt',
  input: {schema: PersonalizedPromptInputSchema},
  output: {schema: PersonalizedPromptOutputSchema},
  prompt: `You are an AI assistant specializing in creating personalized image generation prompts.

  The user loves the following movies:
  {{#each movieTitles}}
  - {{{this}}}
  {{/each}}

  Based on these movies, analyze their visual styles, color palettes, cinematography, and overall aesthetic.
  Incorporate these elements into the following base prompt to create a more personalized and visually appealing image generation prompt:
  Base Prompt: {{{basePrompt}}}

  Personalized Prompt:`, // Handlebars syntax
});

const personalizedCanvasFlow = ai.defineFlow(
  {
    name: 'personalizedCanvasFlow',
    inputSchema: PersonalizedPromptInputSchema,
    outputSchema: PersonalizedPromptOutputSchema,
  },
  async input => {
    const {output} = await personalizedCanvasPrompt(input);
    return output!;
  }
);
