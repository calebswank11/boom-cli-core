import { GraphQLField, TypedefsBase } from '../../@types';
import { TypedefsRegistry } from '../../registries/backend/TypedefsRegistry';
import { snakeToCamel } from '../../utils/stringUtils';

export const graphqlTemplate = (objectTypes: TypedefsBase[]) => {
  const enums: string[] = [];
  const enumsToImport: Set<string> = new Set();
  const imports: Set<string> = new Set();

  // Track which object types are defined in this file
  const localObjectTypes = new Set(
    objectTypes.map((type) => snakeToCamel(type.name) + 'ObjectType'),
  );

  // Get the typedef registry instance
  const typedefRegistry = TypedefsRegistry.getInstance();

  const baseEnum = (name: string) => `
    export const ${name}Type = new GraphQLEnumType({
      name: '${name}Type',
      values: ${name}.reduce<EnumAccumulatorType>((acc, value) => {
        acc[value] = { value };
        return acc;
      }, {}),
    });
  `;

  const baseObjectType = ({ name, description, fields }: TypedefsBase) => {
    const currentObjectType = snakeToCamel(name) + 'ObjectType';

    return `
export const ${currentObjectType} = new GraphQLObjectType({
  name: '${currentObjectType}',
  description:
    '${description}',
  fields: {
    ${fields
      .map((field) => {
        // Check if this is an object type reference
        if (field.type.endsWith('ObjectType')) {
          const typedefName = field.type.replace('ObjectType', '');

          // Skip if it's a self-reference
          if (field.type === currentObjectType) {
            return ``;
          }

          // Skip if the referenced object type doesn't exist
          const typedefInfo = typedefRegistry.getTypedefInfo(typedefName);
          if (!typedefInfo) {
            return ``;
          }

          // Add to imports if it's not a local object type
          if (!localObjectTypes.has(field.type)) {
            imports.add(field.type);
          }
        } else {
          // Handle primitive types
          if (field.type === GraphQLField.GraphQLInt) {
            imports.add('GraphQLInt');
          }
          if (field.type === GraphQLField.GraphQLString) {
            imports.add('GraphQLString');
          }
          if (field.type === GraphQLField.GraphQLBoolean) {
            imports.add('GraphQLBoolean');
          }
          if (field.type === GraphQLField.GraphQLFloat) {
            imports.add('GraphQLFloat');
          }
        }

        if (field.enums) {
          enums.push(baseEnum(field.enums.enumName));
          imports.add('GraphQLEnumType');
          enumsToImport.add(field.enums.enumName);
          return `${field.key}: { type: ${field.enums.enumName}Type }`;
        }
        if (!field.nullable && field.list) {
          imports.add('GraphQLList');
          imports.add('GraphQLNonNull');
          return `${field.key}: {type: new GraphQLList(new GraphQLNonNull(${field.type}))}`;
        }
        if (field.list) {
          imports.add('GraphQLList');
          return `${field.key}: {type: new GraphQLList(${field.type})}`;
        }
        if (!field.nullable) {
          imports.add('GraphQLNonNull');
          return `${field.key}: {type: new GraphQLNonNull(${field.type})}`;
        }
        return `${field.key}: {type: ${field.type}}`;
      })
      .filter((field) => field !== '')
      .join(',\n')}
  },
});
  `;
  };

  const objectTypesToInject = objectTypes.map(baseObjectType).join('\n');

  // Build imports for external object types
  const externalImports = Array.from(imports)
    .filter((imp) => imp.endsWith('ObjectType'))
    .map((imp) => {
      const typedefName = imp.replace('ObjectType', '');
      const typedefInfo = typedefRegistry.getTypedefInfo(typedefName);

      if (!typedefInfo) {
        console.warn(`⚠️ No typedef info found for: ${typedefName}`);
        return '';
      }

      // If the typedef is in the same folder as the current file, use a relative import
      const currentFolder = objectTypes[0]?.name.split('_')[0] || '';
      const importPath =
        typedefInfo.folder === currentFolder ? '.' : `../${typedefInfo.folder}`;

      return `import { ${typedefInfo.objectTypeName} } from '${importPath}'`;
    })
    .filter((imp) => imp !== '')
    .join('\n');

  return `
   import {
    ${Array.from(imports)
      .filter((imp) => !imp.endsWith('ObjectType'))
      .join(',\n')},
    GraphQLObjectType,
   } from 'graphql';
   ${Array.from(enumsToImport).length > 0 ? `import {${Array.from(enumsToImport).join(',\n')}} from '../../../enums'` : ''}
   ${enums ? "import {EnumAccumulatorType} from '../../@types/typedefs'" : ''}
   ${externalImports}

   ${enums.join('\n\n')}

   ${objectTypesToInject}
  `;
};
