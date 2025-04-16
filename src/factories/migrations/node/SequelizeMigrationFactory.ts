import { SqlDataType, TableColumnTypeBase } from '../../../@types';

export class SequelizeMigrationFactory {
  static getMigrationLine(
    type: TableColumnTypeBase,
    columnName: string
  ) {
    return `.${type.name.toLowerCase()}('${columnName}')`
  }
}
