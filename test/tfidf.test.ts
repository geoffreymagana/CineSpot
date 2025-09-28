import { expandByTfIdf, tokenize } from '@/lib/embeddings/tfidf';
import { describe, it, expect } from 'vitest';

describe('TF-IDF expandByTfIdf', () => {
  it('tokenize splits and lowercases', () => {
    const toks = tokenize('The LORD of the Rings: Return!');
    expect(toks).toContain('lord');
    expect(toks).toContain('rings');
  });

  it('expands a query to similar titles', () => {
    const corpus = [
      'The Shawshank Redemption',
      'The Godfather',
      'Pulp Fiction',
      'The Dark Knight',
      "Schindler's List",
      'Fight Club',
    ];
    const expanded = expandByTfIdf(corpus, 'prison drama', 3);
    expect(Array.isArray(expanded)).toBe(true);
    // Should return at most 3 items and items from the corpus
    expect(expanded.length).toBeLessThanOrEqual(3);
    expanded.forEach(e => expect(corpus).toContain(e));
  });
});
