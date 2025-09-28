// Minimal TF-IDF vectorizer for short title expansion and nearest-neighbor lookup
export function tokenize(text: string) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function buildTfIdf(docs: string[]) {
  const df = new Map<string, number>();
  const docsTokens = docs.map(d => tokenize(d));
  docsTokens.forEach(tokens => {
    const seen = new Set<string>();
    for (const t of tokens) {
      if (!seen.has(t)) {
        df.set(t, (df.get(t) || 0) + 1);
        seen.add(t);
      }
    }
  });

  const idf = new Map<string, number>();
  for (const [term, freq] of df.entries()) {
    idf.set(term, Math.log(1 + docs.length / (1 + freq)));
  }

  const tfidfVectors = docsTokens.map(tokens => {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    const vec = new Map<string, number>();
    for (const [t, f] of tf.entries()) {
      vec.set(t, f * (idf.get(t) || 0));
    }
    return vec;
  });

  return { idf, tfidfVectors, docs };
}

export function cosineSim(vecA: Map<string, number>, vecB: Map<string, number>) {
  let num = 0;
  let a2 = 0;
  let b2 = 0;
  for (const [k, v] of vecA.entries()) {
    num += v * (vecB.get(k) || 0);
    a2 += v * v;
  }
  for (const v of vecB.values()) b2 += v * v;
  if (a2 === 0 || b2 === 0) return 0;
  return num / (Math.sqrt(a2) * Math.sqrt(b2));
}

export function expandByTfIdf(docs: string[], query: string, topK = 5) {
  const { tfidfVectors, docs: sourceDocs } = buildTfIdf(docs);
  const qvec = buildTfIdf([query]).tfidfVectors[0];
  const scores = tfidfVectors.map((v, i) => ({ i, s: cosineSim(qvec, v) }));
  scores.sort((a, b) => b.s - a.s);
  return scores.slice(0, topK).map(s => sourceDocs[s.i]);
}
