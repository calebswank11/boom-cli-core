import { APIAggregateData } from '../../@types';
import isEmpty from '../../utils/utilityFunctions/isEmpty';

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

export function buildImportsTemplate({
  utilsImports,
  enumImports,
  typeImports,
  serviceImports,
}: APIAggregateData['imports'], {
  utilsImports: additionalUtilsImports,
  enumImports: additionalEnumImports,
  typeImports: additionalTypeImports,
  serviceImports: additionalServiceImports
}: APIAggregateData['imports']): string {
  let importTemplate = '';
  if (!isEmpty(enumImports)) {
    importTemplate += `import {${enumImports.join(', ')}, ${(additionalEnumImports || []).join(', ')}} from '../../../../enums';`;
  }
  if (!isEmpty(utilsImports)) {
    importTemplate += utilsImports
    .map(
      (utility) =>
        `import ${utility} from '../../../utils/utilityFunctions/${utility}';`,
    )
    .join('\n');
    if (!isEmpty(additionalUtilsImports)) {
      importTemplate += additionalUtilsImports
      .map(
        (utility) =>
          `import ${utility} from '../../../utils/utilityFunctions/${utility}';`,
      )
      .join('\n');
    }
  }
  if (!isEmpty(typeImports)) {
    importTemplate += `import {${typeImports.join(', ')}, ${(additionalTypeImports || []).join(', ')}} from '../../../@types';`;
  }
  if (!isEmpty(serviceImports)) {
    importTemplate += `import {${serviceImports.join(', ')}, ${(additionalServiceImports || []).join(', ')}} from '../../../dataServices';`;
  }
  return importTemplate;
}
