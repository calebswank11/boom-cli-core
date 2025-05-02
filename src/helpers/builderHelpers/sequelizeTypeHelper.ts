import { SqlDataType, TableColumnTypeBase } from '../../@types';

export const sequelizeTypeHelper = (
  type: TableColumnTypeBase,
  enums?: string[],
): string => {
  switch (type.name) {
    case SqlDataType.INT:
      return 'DataTypes.INTEGER';

    case SqlDataType.VARCHAR:
      if (type.limit) {
        return `DataTypes.STRING(${type.limit})`;
      } else {
        return 'DataTypes.STRING';
      }

    case SqlDataType.UUID:
      return 'DataTypes.UUID';

    case SqlDataType.BIGINT:
      return 'DataTypes.BIGINT';

    case SqlDataType.ARRAY:
      return 'DataTypes.ARRAY(Sequelize.STRING)';

    case SqlDataType.BIGSERIAL:
      return 'DataTypes.BIGINT';

    case SqlDataType.BOOLEAN:
      return 'DataTypes.BOOLEAN';

    case SqlDataType.BYTEA:
      return 'DataTypes.BLOB';

    case SqlDataType.CHAR:
      return 'DataTypes.CHAR';

    case SqlDataType.DATE:
      return 'DataTypes.DATE';

    case SqlDataType.DECIMAL:
      return 'DataTypes.DECIMAL';

    case SqlDataType.DOUBLE:
      return 'DataTypes.DOUBLE';

    case SqlDataType.ENUM:
      return `DataTypes.ENUM(${enums?.map((value) => `'${value}'`).join(',')})`;

    case SqlDataType.FLOAT:
      return 'DataTypes.FLOAT';

    case SqlDataType.JSON:
      return 'DataTypes.JSON';

    case SqlDataType.JSONB:
      return 'DataTypes.JSONB';

    case SqlDataType.NUMERIC:
      return 'DataTypes.NUMERIC';

    case SqlDataType.REAL:
      return 'DataTypes.REAL';

    case SqlDataType.SERIAL:
      return 'DataTypes.INTEGER';

    case SqlDataType.SMALLINT:
      return 'DataTypes.SMALLINT';

    case SqlDataType.TEXT:
      return 'DataTypes.TEXT';

    case SqlDataType.TIME:
      return 'DataTypes.TIME';

    case SqlDataType.TIMESTAMP:
      return 'DataTypes.DATE';

    case SqlDataType.TIMESTAMPTZ:
      return 'DataTypes.DATE';
  }
};

export function parseDefaultValue(str: string, enums?: string[]) {
  if (!str) return undefined;

  if (enums) {
    return `'${enums[0]}'`;
  }

  const normalized = str.trim().toUpperCase();

  // Handle NOW() / CURRENT_TIMESTAMP
  if (normalized === 'NOW()' || normalized === 'CURRENT_TIMESTAMP') {
    return `Sequelize.literal('NOW()')`;
  }

  // Booleans
  if (normalized === 'TRUE') return `true`;
  if (normalized === 'FALSE') return `false`;

  // Numbers
  if (!isNaN(str as any) && str.trim() !== '') return Number(str);

  // PostgreSQL array (quick & naive)
  if (str.startsWith('{') && str.endsWith('}')) {
    return `Sequelize.literal('${str}')`;
  }

  // Sequelize literal fallback
  if (str.endsWith('()')) {
    return `Sequelize.literal('${str}')`;
  }

  // Default: treat as string
  return `'${str}'`;
}
