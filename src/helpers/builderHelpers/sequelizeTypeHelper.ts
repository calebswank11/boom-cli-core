import { SqlDataType, TableColumnTypeBase } from '../../@types';

export const sequelizeTypeHelper = (type: TableColumnTypeBase): string => {
  switch (type.name) {
    case SqlDataType.INT:
      return 'Sequelize.INTEGER';

    case SqlDataType.VARCHAR:
      if (type.limit) {
        return `Sequelize.STRING(${type.limit})`;
      } else {
        return 'Sequelize.STRING';
      }

    case SqlDataType.UUID:
      return 'Sequelize.UUID';

    case SqlDataType.BIGINT:
      return 'Sequelize.BIGINT';

    case SqlDataType.ARRAY:
      return 'Sequelize.ARRAY(Sequelize.STRING)';

    case SqlDataType.BIGSERIAL:
      return 'Sequelize.BIGINT';

    case SqlDataType.BOOLEAN:
      return 'Sequelize.BOOLEAN';

    case SqlDataType.BYTEA:
      return 'Sequelize.BLOB';

    case SqlDataType.CHAR:
      return 'Sequelize.CHAR';

    case SqlDataType.DATE:
      return 'Sequelize.DATE';

    case SqlDataType.DECIMAL:
      return 'Sequelize.DECIMAL';

    case SqlDataType.DOUBLE:
      return 'Sequelize.DOUBLE';

    case SqlDataType.ENUM:
      return `'${type.enumBaseName}'`;

    case SqlDataType.FLOAT:
      return 'Sequelize.FLOAT';

    case SqlDataType.JSON:
      return 'Sequelize.JSON';

    case SqlDataType.JSONB:
      return 'Sequelize.JSONB';

    case SqlDataType.NUMERIC:
      return 'Sequelize.NUMERIC';

    case SqlDataType.REAL:
      return 'Sequelize.REAL';

    case SqlDataType.SERIAL:
      return 'Sequelize.INTEGER';

    case SqlDataType.SMALLINT:
      return 'Sequelize.SMALLINT';

    case SqlDataType.TEXT:
      return 'Sequelize.TEXT';

    case SqlDataType.TIME:
      return 'Sequelize.TIME';

    case SqlDataType.TIMESTAMP:
      return 'Sequelize.DATE';

    case SqlDataType.TIMESTAMPTZ:
      return 'Sequelize.DATE';
  }
};
