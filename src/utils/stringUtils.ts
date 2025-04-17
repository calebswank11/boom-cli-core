import { createRequire } from 'module';

const customRequire = createRequire(__filename); // ← no import.meta.url
const prettier = customRequire('prettier');

export const sanitizeSQL = (sql: string): string => {
  return sql
    .replace(/create table/gi, 'CREATE TABLE') // Normalize case
    .replace(/,\s*\)/g, ')') // Remove trailing commas before closing parenthesis
    .trim() // Remove extra spaces
    .replace(/(?<!;)\s*$/, ';'); // Ensure final semicolon
};

export const snakeToPascalCase = (str: string): string =>
  str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

export const pascalToSnakeCase = (str: string): string =>
  str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');

export const pascalToCamel = (str: string): string =>
  str.charAt(0).toLowerCase() + str.slice(1);

export const snakeToCamel = (str: string): string =>
  str
    .split('_')
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');

export const snakeToCapSentence = (str: string): string =>
  str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const camelToPascal = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const extractEnumValues = (line: string): string[] | null => {
  const match = line.match(/ENUM\((.*?)\)/);
  return match ? match[1].split(',').map((v) => v.trim().replace(/'/g, '')) : null;
};

export const sanitizeEnumKey = (value: string): string => {
  return value
    .replace(/[^a-zA-Z0-9_]/g, '_') // Replace invalid characters with underscores
    .replace(/^(\d)/, '_$1') // Ensure the key doesn't start with a number
    .toUpperCase(); // Convert to uppercase for consistency
};

export const replaceExtension = (filename: string, newExtension: string): string => {
  return filename.replace(/\.[^/.]+$/, newExtension);
};

const formats = {
  json: 'json',
  ts: 'typescript',
  js: 'javascript',
  sql: 'sql',
  typescript: 'typescript',
  javascript: 'javascript',
};

export const formatCode = async (code: string, formatType?: string) => {
  const formatTypeLookup = formatType
    ? formats[formatType as keyof typeof formats]
    : 'typescript';
  try {
    return await prettier.format(code, {
      parser: formatTypeLookup,
      singleQuote: true,
      trailingComma: 'all',
      useTabs: false,
      printWidth: 85,
      tabWidth: 2,
      semi: true,
      bracketSpacing: true,
    });
  } catch (err) {
    console.error('Prettier formatting failed:', err);
    return code; // Fallback to raw content if formatting fails
  }
};
