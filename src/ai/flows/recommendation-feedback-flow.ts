
'use server';
/**
 * @fileOverview A flow to process user feedback on recommendations.
 *
 * - processRecommendationFeedback - A function that handles the feedback.
 * - RecommendationFeedbackInput - The input type for the feedback function.
 * - RecommendationFeedbackOutput - The return type for the feedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RecommendationFeedbackInputSchema = z.object({
  title: z.string().describe('The title of the movie or show.'),
  liked: z.boolean().describe('Whether the user liked the recommendation.'),
  reason: z
    .string()
    .optional()
    .describe('The optional reason for disliking the item.'),
});

export type RecommendationFeedbackInput = z.infer<
  typeof RecommendationFeedbackInputSchema
>;

const RecommendationFeedbackOutputSchema = z.object({
  confirmationMessage: z
    .string()
    .describe('A confirmation message to the user.'),
});

export type RecommendationFeedbackOutput = z.infer<
  typeof RecommendationFeedbackOutputSchema
>;

export async function processRecommendationFeedback(
  input: RecommendationFeedbackInput
): Promise<RecommendationFeedbackOutput> {
  return recommendationFeedbackFlow(input);
}

const recommendationFeedbackPrompt = ai.definePrompt({
  name: 'recommendationFeedbackPrompt',
  input: { schema: RecommendationFeedbackInputSchema },
  output: { schema: RecommendationFeedbackOutputSchema },
  prompt: `A user has provided feedback on a recommendation.

  Title: {{{title}}}
  Liked: {{{liked}}}
  {{#if reason}}
  Reason: {{{reason}}}
  {{/if}}

  Based on this, provide a short, friendly confirmation message to the user acknowledging their feedback.
  If they liked it, be positive. If they disliked it, be understanding.
  `,
});

const recommendationFeedbackFlow = ai.defineFlow(
  {
    name: 'recommendationFeedbackFlow',
    inputSchema: RecommendationFeedbackInputSchema,
    outputSchema: RecommendationFeedbackOutputSchema,
  },
  async input => {
    // In a real application, you would store this feedback in a database.
    // This data would then be used to fine-tune future recommendation requests.
    console.log('Received feedback:', input);

    const { output } = await recommendationFeedbackPrompt(input);
    return output!;
  }
);
