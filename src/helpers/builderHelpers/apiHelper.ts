export const apiTypeParsers: Record<
  string,
  (colName: string, enumDictName?: string) => string
> = {
  VARCHAR: (colName) => `string`,
  UUID: (colName) => `string`,
  JSONB: (colName) => `string`,
  TIMESTAMP: (colName) => `string`,
  TIME: (colName) => `string`,
  DATE: (colName) => `string`,
  INT: (colName) => `number`,
  FLOAT: (colName) => `number`,
  DECIMAL: (colName) => `number`,
  NUMERIC: (colName) => `number`,
  ENUM: (colName, enumDictName) => `${enumDictName}`,
  BOOLEAN: (colName) => `boolean`,
  TEXT: (colName) => ` string`,
};

export const apiInlineTypeParsers: Record<
  string,
  (colName: string, enumDictName?: string) => string
> = {
  VARCHAR: (colName) => `string`,
  UUID: (colName) => `string`,
  JSONB: (colName) => `string`,
  TIMESTAMP: (colName) => `string`,
  DATE: (colName) => 'string',
  TIME: (colName) => `string`,
  INT: (colName) => `number`,
  FLOAT: (colName) => `number`,
  DECIMAL: (colName) => `number`,
  NUMERIC: (colName) => `number`,
  ENUM: (colName, enumDictName) =>
    `(typeof ${enumDictName})[keyof typeof ${enumDictName}]`,
  BOOLEAN: (colName) => `boolean`,
  TEXT: (colName) => ` string`,
};
