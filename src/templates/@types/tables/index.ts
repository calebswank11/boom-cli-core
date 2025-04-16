export const typesTemplate = (types: string, enums: string[], enumDir: string) => `
import { TableDefaults } from './helpers';
import {${enums.join(', ')}} from '${enumDir}';
${types}
`;
