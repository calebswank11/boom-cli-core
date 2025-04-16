export const commonIndexTypesTemplate = `
import {
  SortAndFilterBase,
  FilterOptionBase,
  SortAndFilterBaseResp,
} from './refining';
import { Readable } from 'stream';

type File = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Readable;
};

export { SortAndFilterBase, FilterOptionBase, File, SortAndFilterBaseResp };

export * from './refining';
`;
