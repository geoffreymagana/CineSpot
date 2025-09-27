
'use server';
/**
 * @fileoverview A catch-all route handler for Genkit flow APIs.
 *
 * This file exports the GET and POST handlers that power the Genkit flow API.
 * It uses the Genkit Next.js plugin to handle requests.
 */

import { ai } from '@/ai/genkit';

export const { GET, POST } = ai.getApiHandler();
