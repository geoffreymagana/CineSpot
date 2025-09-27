
import {genkit, nextPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI(), nextPlugin()],
});
