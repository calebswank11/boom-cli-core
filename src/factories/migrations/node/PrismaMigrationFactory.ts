import { SqlDataType, TableColumnTypeBase } from '../../../@types';

export class PrismaMigrationFactory {
  static getMigrationLine(
    type: TableColumnTypeBase,
    columnName: string
  ) {
    return `.${type.name.toLowerCase()}('${columnName}')`
  }
}
