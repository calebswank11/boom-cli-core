import { IDataRegistry, SqlDataType, TableStructureBase } from '../@types';
import { camelToPascal, snakeToCapSentence } from '../utils/stringUtils';

export class ExtractEnums {
  static extract(tables: TableStructureBase[]): IDataRegistry['enums'] {
    return tables.reduce<IDataRegistry['enums']>((acc, table) => {
      Object.values(table.columns).map((column) => {
        const { enumName, enumBaseName, enumDictName } = column.type;

        if (
          column.type.name === SqlDataType.ENUM &&
          enumName &&
          enumBaseName &&
          enumDictName
        ) {
          const enumValues = column.enumValues ? column.enumValues : [];
          acc[enumName] = {
            tableName: table.name,
            enumName,
            enumBaseName,
            enumDictName,
            graphQLEnumTypeName: `${camelToPascal(enumDictName)}EnumType`,
            frontendName: `${camelToPascal(enumDictName)}EnumType`,
            values: enumValues,
            description: `Type of ${enumValues.join(', ')}`,
            displayNames: Object.values(enumValues).reduce(
              (acc, cur) => ({
                ...acc,
                [cur]: snakeToCapSentence(cur),
              }),
              {},
            ),
            // TODO Ollama implementation needed
            // valueDescriptions: enumValues.reduce(() => {}, {})
            // sortOrder: [],
            // grouping: {}
          };
        }
      });
      return acc;
    }, {});
  }
}
