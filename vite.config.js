/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// Base path is "/" for local development. The GitHub Pages deploy workflow sets
// VITE_BASE_PATH to "/<repository-name>/" because project sites live in a sub-path.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
