// src/index.ts
import util from 'util';

declare global {
  var pp: (v: unknown) => void;
}

global.pp = (v) =>
  process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'playground'
    ? console.log(util.inspect(v, { depth: null, colors: true }))
    : undefined;
