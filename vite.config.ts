import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src', 'index.ts'),
      name: 'TypeAheadMention',
      fileName: (format) => `type-ahead-mention.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          'react-dom': 'ReactDom',
          react: 'React',
          'react/jsx-runtime': 'ReactJsxRuntime',
        },
        // Ensure CSS is injected into the DOM
        intro: 'if (typeof document !== "undefined") { var style = document.createElement("style"); style.textContent = ""; document.head.appendChild(style); }'
      },
    },
    sourcemap: true,
    cssCodeSplit: false, // Bundle all CSS into JS

  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      rollupTypes: true
    }),
    cssInjectedByJsPlugin(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    },
    // Ensure CSS is processed and bundled
    preprocessorOptions: {
      css: {
        include: /\.module\.css$/
      }
    }
  }
});