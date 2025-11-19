import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src', 'index.ts'),
      name: 'TypeAheadMention',
      fileName: (format) => `type-ahead-mention.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          'react-dom': 'ReactDOM',
          react: 'React',
          'react/jsx-runtime': 'ReactJsxRuntime',
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      rollupTypes: true
    }),
  ],
});