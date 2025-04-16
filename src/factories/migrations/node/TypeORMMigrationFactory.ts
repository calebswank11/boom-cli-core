import { SqlDataType, TableColumnTypeBase } from '../../../@types';

export class TypeORMMigrationFactory {
  static getMigrationLine(
    type: TableColumnTypeBase,
    columnName: string
  ) {
    return `.${type.name.toLowerCase()}('${columnName}')`
  }
}
