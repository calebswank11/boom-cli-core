import { SqlDataType, TypescriptValue } from '../../@types';
import { camelToPascal } from '../../utils/stringUtils';

const baseStringTypescript = (colName: string, required: boolean) => ({
  name: colName,
  value: 'string',
  required,
  graphqlFEType: 'String',
  graphqlBEType: 'GraphQLString',
  nestJSParam: '@IsString',
});
const baseIntTypescript = (colName: string, required: boolean) => ({
  name: colName,
  value: 'number',
  required,
  graphqlFEType: 'Int',
  graphqlBEType: 'GraphQLInt',
  nestJSParam: '@IsNumber',
});

const baseBooleanTypescript = (colName: string, required: boolean) => ({
  name: colName,
  value: 'boolean',
  required,
  graphqlFEType: 'Boolean',
  graphqlBEType: 'GraphQLBoolean',
  nestJSParam: '@IsBoolean',
});

const baseEnumTypescript = (
  colName: string,
  required: boolean,
  enumDictName: string = 'EnumNotFound',
): TypescriptValue => ({
  name: colName,
  value: enumDictName,
  required,
  // not sure if these need to differ
  graphqlFEType: `${camelToPascal(enumDictName)}EnumType`,
  graphqlBEType: `${camelToPascal(enumDictName)}EnumType`,
  nestJSParam: '@IsEnum',
  enumResponse: `(typeof ${enumDictName})[keyof typeof ${enumDictName}]`,
});

const baseFloatTypescript = (colName: string, required: boolean) => ({
  name: colName,
  value: 'number',
  required,
  graphqlFEType: 'Float',
  graphqlBEType: 'GraphQLFloat',
  nestJSParam: '@IsNumber',
});

export const typescriptTypeParsers: Record<
  string,
  (colName: string, required: boolean, enumDictName?: string) => TypescriptValue
> = {
  [SqlDataType.VARCHAR]: baseStringTypescript,
  [SqlDataType.UUID]: baseStringTypescript,
  [SqlDataType.JSONB]: baseStringTypescript,
  [SqlDataType.TIMESTAMP]: baseStringTypescript,
  [SqlDataType.DATE]: baseStringTypescript,
  [SqlDataType.TIME]: baseStringTypescript,
  [SqlDataType.INT]: baseIntTypescript,
  [SqlDataType.NUMERIC]: baseIntTypescript,
  [SqlDataType.FLOAT]: baseFloatTypescript,
  [SqlDataType.DECIMAL]: baseFloatTypescript,
  [SqlDataType.ENUM]: baseEnumTypescript,
  [SqlDataType.BOOLEAN]: baseBooleanTypescript,
  [SqlDataType.TEXT]: baseStringTypescript,
};
