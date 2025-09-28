
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// NOTE: Do NOT import or initialize the Next.js plugin here. This file is imported
// by server components and other modules during SSR. Importing the Next plugin
// (`@genkit-ai/next`) can attempt to use Next's `Request`/`NextRequest` runtime
// APIs too early and cause runtime errors like `req.json is not a function`.
//
// The Next-specific adapter should be applied only inside the API route
// handler (src/app/api/genkit/[...id]/route.ts) where the request shape matches
// what the plugin expects.

export const ai = genkit({
  plugins: [googleAI()],
});
