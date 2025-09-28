
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/spotlight-recommendations.ts';
import '@/ai/flows/recommendation-feedback-flow.ts';
// personalized-canvas flow removed; Dicebear-based fallback is used instead for images
