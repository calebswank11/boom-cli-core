import { TableStructureBase, TypescriptData, TypescriptValue } from '../@types';
import { typescriptTypeParsers } from '../helpers';

const defaultTypescriptValues: Record<string, TypescriptValue> = {
  id: {
    name: 'id',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
  },
  created_at: {
    name: 'created_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
  },
  updated_at: {
    name: 'updated_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
  },
  deleted_at: {
    name: 'deleted_at',
    value: 'string',
    graphqlFEType: 'String',
    graphqlBEType: 'GraphQLString',
    nestJSParam: '@IsString',
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
      };
      Object.values(table.columns).map((tableColumn) => {
        typescriptDataObject.values[tableColumn.name] = typescriptTypeParsers[
          tableColumn.type.name
        ](tableColumn.name, tableColumn.nullable, tableColumn.type.enumDictName);
      });
      typescriptData[table.pascalCase] = typescriptDataObject;
    });
    return typescriptData;
  }
}
