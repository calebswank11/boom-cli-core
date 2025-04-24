import {
  SqlDataType,
  TableColumnStructureBase,
  TypescriptValue,
} from '../../@types';
import { camelToPascal } from '../../utils/stringUtils';

const baseStringTypescript = ({
  name,
  isRequired,
  validationRules,
}: TableColumnStructureBase): TypescriptValue => ({
  name,
  value: 'string',
  required: isRequired,
  graphqlFEType: 'String',
  graphqlBEType: 'GraphQLString',
  nestJSParam: '@IsString',
  description: '// string',
  example: 'string',
  validationRules,
});
const baseIntTypescript = ({
  name,
  isRequired,
  validationRules,
}: TableColumnStructureBase): TypescriptValue => ({
  name,
  value: 'number',
  required: isRequired,
  graphqlFEType: 'Int',
  graphqlBEType: 'GraphQLInt',
  nestJSParam: '@IsNumber',
  description: '// number',
  example: '123',
  validationRules,
});

const baseBooleanTypescript = ({
  name,
  isRequired,
  validationRules,
}: TableColumnStructureBase): TypescriptValue => ({
  name: name,
  value: 'boolean',
  required: isRequired,
  graphqlFEType: 'Boolean',
  graphqlBEType: 'GraphQLBoolean',
  nestJSParam: '@IsBoolean',
  description: '// boolean',
  example: 'false',
  validationRules,
});

const baseEnumTypescript = ({
  name,
  isRequired,
  type,
  validationRules,
  enumValues,
}: TableColumnStructureBase): TypescriptValue => {
  const enumDictName = type.enumDictName || 'EnumNotFound';
  return {
    name,
    value: enumDictName,
    required: isRequired,
    // not sure if these need to differ
    graphqlFEType: `${camelToPascal(enumDictName)}EnumType`,
    graphqlBEType: `${camelToPascal(enumDictName)}EnumType`,
    nestJSParam: '@IsEnum',
    enumResponse: `(typeof ${enumDictName})[keyof typeof ${enumDictName}]`,
    description: `// one of ${(enumValues || []).join(' | ')}`,
    example: (enumValues || ['EnumNotFound'])[0],
    validationRules,
  };
};

const baseFloatTypescript = ({
  name,
  isRequired,
  validationRules,
}: TableColumnStructureBase): TypescriptValue => ({
  name,
  value: 'number',
  required: isRequired,
  graphqlFEType: 'Float',
  graphqlBEType: 'GraphQLFloat',
  nestJSParam: '@IsNumber',
  description: '// float as a number',
  example: '1.02',
  validationRules,
});

export const typescriptTypeParsers: Record<
  string,
  (tableColumn: TableColumnStructureBase) => TypescriptValue
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
