import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/type-ahead-mention/',
  resolve: {
    alias: {
      'type-ahead-mention': path.resolve(__dirname, '../packages/core/src'),
    },
  },
});