import { build } from 'vite';

await build({
  configFile: false,
  mode: 'production',
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
  },
});
