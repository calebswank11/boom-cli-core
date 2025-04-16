import { SqlDataType, TableColumnTypeBase } from '../../../@types';

export class KnexMigrationFactory {
  static getMigrationLine(type: TableColumnTypeBase, columnName: string) {
    switch (type.name) {
      case SqlDataType.INT:
        return `.integer('${columnName}')`;
      case SqlDataType.SMALLINT:
        return `.smallint('${columnName}')`;
      case SqlDataType.BIGINT:
        return `.bigint('${columnName}')`;
      case SqlDataType.VARCHAR:
        return `.string('${columnName}', ${type.limit})`;
      case SqlDataType.CHAR:
        return `.charset('${columnName}')`;
      case SqlDataType.TEXT:
        return `.text('${columnName}')`;
      case SqlDataType.BOOLEAN:
        return `.boolean('${columnName}')`;
      case SqlDataType.DECIMAL:
        return `.decimal('${columnName}', ${type.precision})`;
      case SqlDataType.NUMERIC:
        return `.integer('${columnName}')`;
      case SqlDataType.FLOAT:
      case SqlDataType.REAL:
        return `.float('${columnName}', ${type.precision ?? 8})`;
      case SqlDataType.DOUBLE:
        return `.double('${columnName}', ${type.precision})`;
      case SqlDataType.SERIAL:
      case SqlDataType.BIGSERIAL:
        return `.increments('${columnName}')`;
      case SqlDataType.DATE:
        return `.date('${columnName}')`;
      case SqlDataType.TIME:
        return `.time('${columnName}')`;
      case SqlDataType.TIMESTAMP:
        return `.timestamp('${columnName}')`;
      case SqlDataType.TIMESTAMPTZ:
        return `.timestamp('${columnName}', { useTz: true })`;
      case SqlDataType.JSON:
        return `.json('${columnName}')`;
      case SqlDataType.JSONB:
        return `.jsonb('${columnName}')`;
      case SqlDataType.UUID:
        return `.uuid('${columnName}')`;
      case SqlDataType.BYTEA:
        return `.binary('${columnName}')`;
      case SqlDataType.ARRAY:
        return `.specificType('${columnName}', 'text[]')`;
      default:
        return `.${type.name.toLowerCase()}('${columnName}')`;
    }
  }
}
