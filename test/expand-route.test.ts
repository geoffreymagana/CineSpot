import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/local/expand/route';

describe('local expand API route', () => {
  it('returns expanded titles for a simple corpus', async () => {
    const body = { corpus: ['A', 'B', 'C', 'D'], query: 'A', topK: 2 };
    const req = new Request('http://localhost/api/local/expand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    // The route returns a NextResponse; unwrap by getting json
    // NextResponse has a json() method when running inside Next; in our test environment POST returns a Response-like object
    // Fall back: if res has json, call it; otherwise assume it's a Response
    const json = await (res as any).json();
    expect(json).toHaveProperty('expanded');
    expect(Array.isArray(json.expanded)).toBe(true);
  });
});
