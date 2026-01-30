import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: './packages/index.ts',
  minify: true,
  dts: true,
});
