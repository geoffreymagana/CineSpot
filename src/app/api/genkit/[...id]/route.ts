
'use server';
/**
 * @fileoverview A catch-all route handler for Genkit flow APIs.
 *
 * This file exports the GET and POST handlers that power the Genkit flow API.
 * It uses the Genkit Next.js plugin to handle requests.
 */

import { ai } from '@/ai/genkit';
import type { NextRequest } from 'next/server';

// Lazily create the Genkit API handler inside request handlers so that
// `@genkit-ai/next` (which may rely on Next's Request runtime) is not
// imported at module initialization time (which can cause `req.json is not a function`).

async function createHandler() {
		// Import the Next adapter at request time only
		const { nextAdapter } = await import('@genkit-ai/next');
		// Apply adapter plugin to ai instance (cast to any to avoid TypeScript issues with Genkit typings)
		(ai as any).use(nextAdapter());
		return (ai as any).getApiHandler();
}

export async function GET(req: Request) {
	const handler = await createHandler();
	// Adapt Next's Request to the handler
	return handler.GET(req as unknown as NextRequest);
}

export async function POST(req: Request) {
	const handler = await createHandler();
	return handler.POST(req as unknown as NextRequest);
}
