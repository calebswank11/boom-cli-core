import path from 'path';
import { PathLike } from 'node:fs';

export const getRandomIdx = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};
