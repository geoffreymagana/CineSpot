
'use server';
/**
 * @fileoverview A catch-all route handler for Genkit flow APIs.
 *
 * This file exports the GET and POST handlers that power the Genkit flow API.
 * It uses the Genkit Next.js plugin to handle requests.
 */

import { createNextApiHandler } from '@genkit-ai/next';

export const { GET, POST } = createNextApiHandler();
