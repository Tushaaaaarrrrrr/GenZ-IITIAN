import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts: mixing the project's Vite plugins into the
// vitest config pulls in vitest's own (differently-versioned) Vite types and
// breaks `tsc --noEmit`. Unit tests here only need Node, no plugins.
export default defineConfig({
  test: {
    environment: 'node',
  },
});
