
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/spotlight-recommendations.ts';
import '@/ai/flows/get-season-details-flow.ts';
import '@/ai/flows/recommendation-feedback-flow.ts';
import '@/ai/flows/personalized-canvas.ts';
