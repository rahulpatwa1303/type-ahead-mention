import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/type-ahead-mention/',
  resolve: {
    // Build the page against the library source, so the demo always shows the current code
    alias: {
      'type-ahead-mention': fileURLToPath(new URL('../packages/core/src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom', '@codemirror/state', '@codemirror/view', '@codemirror/autocomplete'],
  },
});
