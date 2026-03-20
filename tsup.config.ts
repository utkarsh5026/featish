import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node18',
    clean: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    entry: ['src/api.ts'],
    format: ['esm'],
    target: 'node18',
    dts: true,
  },
]);
