declare module 'next-pwa';

declare module '@genkit-ai/next' {
  // Minimal typing to satisfy imports used in the project. The real package
  // exposes an adapter factory; we provide a loose type here so TS is happy.
  export function nextAdapter(options?: any): any;
  const _default: any;
  export default _default;
}

declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function expect(actual: any): any;
}

// Allow importing JSON files
declare module '*.json' {
  const value: any;
  export default value;
}
