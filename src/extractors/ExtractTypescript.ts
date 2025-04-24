import { TableStructureBase, TypescriptData, TypescriptValue } from '../@types';
import { typescriptTypeParsers } from '../helpers';
import { randomUUID } from 'node:crypto';

const defaultTypescriptValues: Record<string, TypescriptValue> = {
  id: {
    name: 'id',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
    required: true,
    description: 'Primary key',
    example: randomUUID(),
  },
  created_at: {
    name: 'created_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
    required: false,
    description: 'Created Timestamp',
    example: new Date().toISOString(),
  },
  updated_at: {
    name: 'updated_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
    required: false,
    description: 'Last Updated Timestamp',
    example: new Date().toISOString(),
  },
  deleted_at: {
    name: 'deleted_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
    required: false,
    description: 'Deleted Timestamp',
    example: new Date().toISOString(),
  },
};

export class ExtractTypescript {
  static extract(
    tables: TableStructureBase[],
    parentFolder: string,
    exportFolder: string,
  ): Record<string, TypescriptData> {
    const typescriptData: Record<string, TypescriptData> = {};

    tables.map((table) => {
      // process individual table
      const typescriptDataObject: TypescriptData = {
        name: table.pascalCase,
        tableName: table.name,
        values: {
          ...defaultTypescriptValues,
        },
        parentFolder,
        exportFolder,
        description: table.description,
        extends: ['TableDefaults'],
      };
      Object.values(table.columns).map((tableColumn) => {
        typescriptDataObject.values[tableColumn.name] =
          typescriptTypeParsers[tableColumn.type.name](tableColumn);
      });
      typescriptData[table.pascalCase] = typescriptDataObject;
    });
    return typescriptData;
  }
}
