
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized
 * image prompt based on a user's movie preferences.
 *
 * - generatePersonalizedPrompt - A function that takes a base prompt and a list of
 *   movie titles and returns a new, stylized prompt.
 * - PersonalizedPromptInput - The input type for the generatePersonalizedPrompt function.
 * - PersonalizedPromptOutput - The return type for the generatePersonalizedPrompt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

// Define the input schema for the flow
const PersonalizedPromptInputSchema = z.object({
  movieTitles: z
    .array(z.string())
    .describe(
      'A list of movie titles that the user likes, which will be used to influence the visual style.'
    ),
  basePrompt: z
    .string()
    .describe(
      'The user-provided base prompt or idea for the image.'
    ),
});

export type PersonalizedPromptInput = z.infer<
  typeof PersonalizedPromptInputSchema
>;

// Define the output schema for the flow
const PersonalizedPromptOutputSchema = z.object({
  personalizedPrompt: z
    .string()
    .describe(
      'The generated prompt, infused with stylistic elements from the provided movies.'
    ),
});

export type PersonalizedPromptOutput = z.infer<
  typeof PersonalizedPromptOutputSchema
>;

// Exported function to call the flow
export async function generatePersonalizedPrompt(
  input: PersonalizedPromptInput
): Promise<PersonalizedPromptOutput> {
  return personalizedCanvasFlow(input);
}

// Define the prompt
const personalizedCanvasPrompt = ai.definePrompt({
  name: 'personalizedCanvasPrompt',
  input: { schema: PersonalizedPromptInputSchema },
  output: { schema: PersonalizedPromptOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that helps users create visually stunning image generation prompts.
Your task is to take a user's base idea and combine it with the cinematic and artistic styles of their favorite movies.

Analyze the visual identity of the following movies:
{{#each movieTitles}}
- {{{this}}}
{{/each}}

Consider their color palettes, lighting techniques, camera angles, genre aesthetics (e.g., sci-fi, fantasy, noir), and overall mood.

Now, take the user's base prompt: "{{{basePrompt}}}"

Transform the base prompt into a more descriptive and artistic prompt for an image generation model like DALL-E or Midjourney. Infuse it with the stylistic elements you analyzed from the movies. Create a single, cohesive, and powerful new prompt.
Example: If the movies are "Blade Runner" and "The Matrix" and the base prompt is "a person in a city", a good result would be: "A lone figure in a rain-slicked trench coat stands under the neon glow of a futuristic city, digital rain and holographic advertisements reflecting in the puddles at their feet, cinematic, moody, chiaroscuro lighting, cyberpunk aesthetic."
`,
});

// Define the Genkit flow
const personalizedCanvasFlow = ai.defineFlow(
  {
    name: 'personalizedCanvasFlow',
    inputSchema: PersonalizedPromptInputSchema,
    outputSchema: PersonalizedPromptOutputSchema,
  },
  async input => {
    const { output } = await personalizedCanvasPrompt(input);
    return output!;
  }
);

