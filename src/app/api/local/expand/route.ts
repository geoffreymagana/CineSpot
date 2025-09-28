import { NextResponse } from 'next/server';
import { expandByTfIdf } from '@/lib/embeddings/tfidf';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { corpus, query, topK } = body;
    if (!Array.isArray(corpus) || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const expanded = expandByTfIdf(corpus, query, topK || 5);
    return NextResponse.json({ query, expanded });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export const GET = () => NextResponse.json({ ok: true });
