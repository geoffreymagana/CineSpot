import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from 'firebase-admin';
import { getTitleDetails } from '@/lib/services/tmdb';
import { normalizeTitle } from '@/lib/utils';

// This route requires a secret to be set in the environment: RESYNC_ADMIN_SECRET
// Usage: POST /api/admin/resync-titles with JSON body { userId: string }

if (!admin.apps.length) {
  // firebase-admin requires service account credentials; expect GOOGLE_APPLICATION_CREDENTIALS
  try {
    admin.initializeApp();
  } catch (e) {
    console.warn('Failed to initialize firebase-admin; make sure GOOGLE_APPLICATION_CREDENTIALS is set in your environment when running this endpoint in an environment with access to Firestore.');
  }
}

const db = admin.firestore();

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-resync-secret') || process.env.RESYNC_ADMIN_SECRET;
  if (!secret || secret !== process.env.RESYNC_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId } = body;
  if (!userId || typeof userId !== 'string') {
    return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
  }

  try {
    const moviesRef = db.collection('users').doc(userId).collection('movies');
    const snapshot = await moviesRef.get();

    const results: any[] = [];

    for (const doc of snapshot.docs) {
      const movieId = Number(doc.id);
      if (!movieId) continue;

      try {
        const tmdb = await getTitleDetails(movieId as number, (doc.data() as any).media_type || undefined);
        // Ensure we use the same normalization
        const normalized = normalizeTitle(tmdb);
        const updateData: any = {
          title: normalized.title,
          poster_path: normalized.poster_path,
          backdrop_path: normalized.backdrop_path,
          release_date: normalized.release_date,
          vote_average: normalized.vote_average,
          runtime: normalized.runtime,
          genres: normalized.genres,
          media_type: normalized.media_type,
          tagline: normalized.tagline,
          videos: normalized.videos,
          images: normalized.images,
          credits: normalized.credits,
        };

        await moviesRef.doc(String(movieId)).update(updateData);
        results.push({ id: movieId, status: 'updated' });
      } catch (e: any) {
        results.push({ id: movieId, status: 'failed', message: e?.message || String(e) });
      }
    }

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (e: any) {
    console.error('Resync failed', e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
