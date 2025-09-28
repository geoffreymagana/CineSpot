import { NextResponse } from 'next/server';

type AIInput = {
  watchedTitles: string;
  addedTitles: string;
  likedTitles: string;
  collectedTitles: string[];
};

/**
 * POST /api/openai/recommendations
 * Server-side fallback to OpenAI for title suggestion if Genkit/Google fails.
 * Uses OPEN_AI_API_KEY from environment. Returns JSON in the same shape as the Genkit flow.
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPEN_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
  }

  let bodyRaw: unknown = null;
  try {
    bodyRaw = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Normalize payload to a safe shape so TypeScript doesn't complain about nulls
  const payload = (bodyRaw as Partial<AIInput> | null) ?? {};
  const watchedTitles = typeof payload.watchedTitles === 'string' ? payload.watchedTitles : '';
  const addedTitles = typeof payload.addedTitles === 'string' ? payload.addedTitles : '';
  const likedTitles = typeof payload.likedTitles === 'string' ? payload.likedTitles : '';
  const collectedTitles = Array.isArray(payload.collectedTitles) ? payload.collectedTitles : [];

  const system = `You are a concise movie and TV suggestion assistant. Return only JSON with two fields: topPicks (array of 5 titles) and carousels (array of { title, recommendations: [5 titles] }). Do not include any commentary.`;

  const userPrompt = `User context:\n- Recently Watched: ${watchedTitles}\n- Recently Added: ${addedTitles}\n- Liked: ${likedTitles}\n- Already in library: ${collectedTitles.join(', ') || 'None'}\n\nProvide topPicks and 1-3 carousels such as "Because you watched...", each with 5 titles. Only return JSON.`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return NextResponse.json({ error: 'OpenAI error', details: txt }, { status: 502 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Attempt to extract JSON from the model output
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonText = content.slice(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(jsonText);
        return NextResponse.json(parsed);
      } catch (e) {
        // If parsing fails, fallback to an empty deterministic response
        return NextResponse.json({ topPicks: [], carousels: [] }, { status: 200 });
      }
    }

    return NextResponse.json({ topPicks: [], carousels: [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI request failed', details: String(e) }, { status: 500 });
  }
}
