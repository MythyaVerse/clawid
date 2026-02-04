import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI entry point with shebang
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    clean: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // API entry point without shebang
  {
    entry: { api: 'src/api.ts' },
    format: ['esm'],
    dts: true,
    shims: true,
  },
]);
