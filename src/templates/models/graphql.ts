import { TypedefsBase } from '../../@types';
import { snakeToCamel } from '../../utils/stringUtils';

export const graphqlTemplate = (objectTypes: TypedefsBase[]) => {
  const enums: string[] = [];
  const enumsToImport: string[] = [];
  const imports: string[] = [];

  const baseEnum = (name: string) => `
    export const ${name}Type = new GraphQLEnumType({
      name: '${name}Type',
      values: ${name}.reduce<EnumAccumulatorType>((acc, value) => {
        acc[value] = { value };
        return acc;
      }, {}),
    });
  `;

  const baseObjectType = ({ name, description, fields }: TypedefsBase) => `
export const ${snakeToCamel(name)}ObjectType = new GraphQLObjectType({
  name: '${snakeToCamel(name)}ObjectType',
  description:
    '${description}',
  fields: {
    ${fields
      .map((field) => {
        imports.push(field.type);
        if (field.enums) {
          enums.push(baseEnum(field.enums.enumName));
          enumsToImport.push(field.enums.enumName);
          return `${field.key}: { type: ${field.enums.enumName}Type }`;
        }
        if (!field.nullable && field.list) {
          imports.push('GraphQLList');
          imports.push('GraphQLNonNull');
          return `${field.key}: {type: new GraphQLList(new GraphQLNonNull(${field.type}))}`;
        }
        if (field.list) {
          imports.push('GraphQLList');
          return `${field.key}: {type: new GraphQLList(${field.type})}`;
        }
        if (!field.nullable) {
          imports.push('GraphQLNonNull');
          return `${field.key}: {type: new GraphQLNonNull(${field.type})}`;
        }
        return `${field.key}: {type: ${field.type}}`;
      })
      .join(',\n')}
  },
});
  `;

  const objectTypesToInject = objectTypes.map(baseObjectType).join('\n');

  return `
   import {
    ${[...new Set(imports)].join(',\n')},
    GraphQLObjectType,
   } from 'graphql';
   ${enumsToImport.length > 0 ? `import {${enumsToImport.join(',\n')}} from '../../../enums'` : ''}
   ${enums ? "import {EnumAccumulatorType} from '../../@types/typedefs'" : ''}
  
   ${enums.join('\n\n')}
  
   ${objectTypesToInject}
  `;
};
