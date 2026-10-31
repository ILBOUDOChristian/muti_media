import { build } from 'vite';

await build({
  configFile: false,
  mode: 'production',
  esbuild: {
    drop: ['debugger'],
    legalComments: 'none',
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
  },
});
