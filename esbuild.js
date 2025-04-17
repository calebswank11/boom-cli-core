const esbuild = require('esbuild');
const fs = require('fs');

const external = [
  // 'tedious',
  // 'better-sqlite3',
  // 'mysql2',
  // 'mysql',
  // 'sqlite3',
  // 'pg-query-stream',
  // 'oracledb',
  // 'prettier',
  // '@aws-sdk/client-dynamodb',
  // '@aws-sdk/client-lambda',
  // '@aws-sdk/client-s3',
  // '@aws-sdk/lib-dynamodb',
  // allegedly, these are included in lambda runtime.
  // '@aws-sdk/client-s3',
  // '@aws-sdk/client-secrets-manager',
  // '@aws-sdk/client-sts',
  // '@aws-sdk/lib-storage',
  // '@aws-sdk/s3-request-presigner',
  // '@mapbox',
  // 'knex',
];

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
      entryPoints: config.entryPoints,
      // outfile: path.join(config.outdir, config.outfile),
      outdir: config.outdir,
      // entryNames: 'index',
      outExtension: { '.js': '.js' },
      // write: false,
      // base config
      bundle: true,
      minify: true,
      platform: 'node',
      target: 'es2020',
      external,
      sourcemap: config.sourceMap,
      logLevel: 'info',
      treeShaking: true,
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
