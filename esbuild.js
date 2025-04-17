const esbuild = require('esbuild');
const fs = require('fs');

const entryPointsConfig = [
  {
    entryPoints: ['./src/cli'],
    outdir: 'dist.cli',
    sourceMap: false,
  },
];

const build = async () => {
  for (const config of entryPointsConfig) {
    fs.mkdirSync(config.outdir, { recursive: true });
    const buildConfigBase = {
      entryPoints: ['./src/index.ts'],
      outfile: 'dist/cli.js',
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      banner: {
        js: '#!/usr/bin/env node',
      },
    };

    if (config.outfile) {
      buildConfigBase.entryNames = 'index';
    }

    if (config.outbase) {
      buildConfigBase.outbase = config.outbase;
    }

    await esbuild
      .build(buildConfigBase)
      .then(() => {
        console.log(`Build complete for ${config.outdir}`);
      })
      .catch(() => process.exit());
  }
};

build();
