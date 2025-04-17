const esbuild = require('esbuild');
const fs = require('fs');

const build = async () => {
  fs.mkdirSync('dist', { recursive: true });
  const buildConfigBase = {
    entryPoints: ['./src/cli.ts'],
    outfile: 'dist/cli.js',
    bundle: true,
    platform: 'node',
    target: 'es2020',
    format: 'cjs',
    minify: true,
    logLevel: 'info',
    treeShaking: true,
    external: ['prettier', 'prettier-plugin-organize-imports'],
  };

  await esbuild
    .build(buildConfigBase)
    .then(() => {
      console.log(`Build complete for ${config.outdir}`);
    })
    .catch(() => process.exit());
};

build();
