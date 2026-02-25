import * as esbuild from 'esbuild';

const buildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  outfile: 'dist/bundle.js',
  logLevel: 'info',
};

const watch = process.argv.includes('--watch');

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
}
