import { extractEnumValues, snakeToCamel } from '../../utils/stringUtils';

export const sqlTypeParsers: Record<
  string,
  (colType: string, colName: string, tableName?: string) => any
> = {
  VARCHAR: (colType, colName) => {
    const sizeMatch = colType.match(/\((\d+)\)/);
    return {
      name: colName,
      type: { name: 'VARCHAR', limit: sizeMatch ? parseInt(sizeMatch[1], 10) : 255 },
    };
  },
  UUID: (colType, colName) => ({ name: colName, type: { name: 'UUID' } }),
  JSONB: (colType, colName) => ({ name: colName, type: { name: 'JSONB' } }),
  DATE: (colType, colName) => ({ name: colName, type: { name: 'DATE' } }),
  TIMESTAMP: (colType, colName) => ({ name: colName, type: { name: 'TIMESTAMP' } }),
  TIME: (colType, colName) => ({ name: colName, type: { name: 'TIME' } }),
  INT: (colType, colName) => ({ name: colName, type: { name: 'INT' } }),
  FLOAT: (colType, colName) => ({ name: colName, type: { name: 'FLOAT' } }),
  NUMERIC: (colType, colName) => {
    const match = colType.match(/\s*\((\d+)\s*,\s*(\d+)\s*\)/);

    return {
      name: colName,
      type: {
        name: 'NUMERIC',
        precision: match ? parseInt(match[1], 10) : 10,
        scale: match ? parseInt(match[2], 10) : 0,
      },
    };
  },
  DECIMAL: (colType, colName) => {
    const match = colType.match(/\s*\((\d+)\s*,\s*(\d+)\s*\)/);
    return {
      name: colName,
      type: {
        name: 'DECIMAL',
        precision: match ? parseInt(match[1], 10) : 10,
        scale: match ? parseInt(match[2], 10) : 0,
      },
    };
  },
  ENUM: (colType, colName, tableName) => {
    const enumValues = extractEnumValues(colType);
    if (enumValues && enumValues.length) {
      return {
        name: colName,
        type: {
          name: 'ENUM',
          enumBaseName: colName,
          enumDictName: snakeToCamel(`${tableName}_${colName}_enum_dict`),
          enumName: snakeToCamel(`${tableName}_${colName}_enum`),
        },
        enumValues,
      };
    }
    return {
      name: colName,
      type: {
        name: 'ENUM',
        enumBaseName: colName,
        enumDictName: snakeToCamel(`${tableName}_${colName}_enum_dict`),
        enumName: snakeToCamel(`${tableName}_${colName}_enum`),
      },
      enumValues: [],
    };
  },
  BOOLEAN: (colType, colName) => ({ name: colName, type: { name: 'BOOLEAN' } }),
  TEXT: (colType, colName) => ({ name: colName, type: { name: 'TEXT' } }),
};
