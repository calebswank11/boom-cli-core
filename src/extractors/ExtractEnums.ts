import { IDataRegistry, SqlDataType, TableStructureBase } from '../@types';
import { camelToPascal } from '../utils/stringUtils';

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
          acc[enumName] = {
            tableName: table.name,
            enumName,
            enumBaseName,
            enumDictName,
            graphQLEnumTypeName: `${camelToPascal(enumDictName)}EnumType`,
            frontendName: `${camelToPascal(enumDictName)}EnumType`,
            values: column.enumValues ? column.enumValues : [],
          };
        }
      });
      return acc;
    }, {});
  }
}
