import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // ESM: MentionInput's import('./editor/...') becomes its own chunk,
    // so CodeMirror downloads only when the editor is first rendered
    entry: { index: 'src/index.ts', codemirror: 'src/codemirror.ts' },
    format: ['esm'],
    splitting: true,
    dts: true,
    clean: true,
    target: 'es2020',
    external: ['react', 'react-dom', /^@codemirror\//],
  },
  {
    entry: { index: 'src/index.ts', codemirror: 'src/codemirror.ts' },
    format: ['cjs'],
    dts: true,
    target: 'es2020',
    external: ['react', 'react-dom', /^@codemirror\//],
  },
]);
