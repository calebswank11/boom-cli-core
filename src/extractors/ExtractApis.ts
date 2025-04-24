import { APIArgument, APIData, APIFolderData, TableStructureBase } from '../@types';
import {
  snakeToCamel,
  snakeToCapSentence,
  snakeToPascalCase,
} from '../utils/stringUtils';
import { MethodTypeFactory } from '../factories/endpoints/node/MethodTypeFactory';
import { apiInlineTypeParsers, apiTypeParsers } from '../helpers';
import { DataRegistry } from '../registries/DataRegistry';

const dataRegistry = DataRegistry.getInstance();

const defaultArgs: Record<string, APIArgument> = {
  id: {
    name: 'id',
    pascalCase: 'id',
    camelCase: 'id',
    capSentenceCase: 'Id',
    helperFunctionNameBase: 'id',
    type: 'string',
    required: true,
    argWithType: ['id', 'string'],
  },
  created_at: {
    name: 'created_at',
    pascalCase: 'CreatedAt',
    camelCase: 'createdAt',
    capSentenceCase: 'Created At',
    helperFunctionNameBase: 'createdAt',
    type: 'string',
    required: false,
    argWithType: ['created_at', 'string'],
  },
  updated_at: {
    name: 'updated_at',
    pascalCase: 'UpdatedAt',
    camelCase: 'updatedAt',
    capSentenceCase: 'Updated At',
    helperFunctionNameBase: 'updatedAt',
    type: 'string',
    required: false,
    argWithType: ['updated_at', 'string'],
  },
  deleted_at: {
    name: 'deleted_at',
    pascalCase: 'DeletedAt',
    camelCase: 'deletedAt',
    capSentenceCase: 'Deleted At',
    helperFunctionNameBase: 'deletedAt',
    type: 'string',
    required: false,
    argWithType: ['deleted_at', 'string'],
  },
};

export class ExtractApis {
  static extract(
    tables: TableStructureBase[],
    folderData: Partial<APIFolderData>,
  ): Record<string, APIData> {
    const apiDataObj: Record<string, APIData> = {};

    const defaultArgNames = Object.keys(defaultArgs);
    tables.map((table) => {
      // process individual table

      const columns = Object.values(table.columns);
      const apiData: APIData = {
        name: table.name,
        pascalCase: snakeToPascalCase(table.name),
        camelCase: snakeToCamel(table.name),
        capSentenceCase: snakeToCapSentence(table.name),
        tableName: table.name,
        // not sure this is right...
        responseType: table.pascalCase,
        folders: {
          ...folderData,
          parent: dataRegistry.getApiToTableRelationship(table.name) as string,
        } as APIFolderData,
        args: {
          ...defaultArgs,
        },
        byFields: [],
        // allow limitation of api types in the config.
        methods: MethodTypeFactory.buildMethods(),
        // TODO Ollama implementation needed
        // documentation: {},
        pagination: {
          enabled: columns.some(col => col.searchable || col.sortable || col.filterable),
          defaultPageSize: 10,
          maxPageSize: 100,
          strategy: 'offset',
        }
      };

      if(columns.some(col => col.sensitiveData)) {
        apiData.security = {
          requiresAuth: true,
          roles: [],
          permissions: [],
        }
      }

      columns.map((tableColumn) => {
        const argType = apiTypeParsers[tableColumn.type.name](
          tableColumn.name,
          tableColumn.type.enumDictName,
        );
        const inlineArgType = apiInlineTypeParsers[tableColumn.type.name](
          tableColumn.name,
          tableColumn.type.enumDictName,
        );
        const argument: APIArgument = {
          name: tableColumn.name,
          pascalCase: snakeToPascalCase(tableColumn.name),
          camelCase: snakeToCamel(tableColumn.name),
          capSentenceCase: snakeToCapSentence(tableColumn.name),
          helperFunctionNameBase: snakeToCamel(
            tableColumn.name.replace(/_id$/g, ''),
          ),
          type: argType,
          required: tableColumn.nullable,
          argWithType: [tableColumn.name, inlineArgType],
        };
        if (tableColumn.unique) {
          apiData.byFields.push(tableColumn.name);
        }
        if (!defaultArgNames.includes(argument.name)) {
          apiData.args[argument.name] = argument;
        }
      });
      apiDataObj[table.name] = apiData;
    });
    return apiDataObj;
  }
}
