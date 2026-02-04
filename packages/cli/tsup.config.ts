import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/api.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  banner: ({ entryPoint }) => {
    // Only add shebang to CLI entry point
    if (entryPoint === 'src/index.ts') {
      return { js: '#!/usr/bin/env node' };
    }
    return {};
  },
});
