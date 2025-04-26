import { TableColumnStructureBase } from '../../../@types';
import { sequelizeTypeHelper } from '../../../helpers/builderHelpers/sequelizeTypeHelper';

export class SequelizeMigrationFactory {
  static getMigrationLine(tableColumn: TableColumnStructureBase) {
    let sequelizeColObj = `${tableColumn.camelCase}: {`;

    if (tableColumn.primary) {
      sequelizeColObj += 'primaryKey: true,';
    }

    if (!tableColumn.nullable) {
      sequelizeColObj += 'allowNull: false,';
    }

    if (tableColumn.default) {
      sequelizeColObj += `defaultValue: Sequelize.literal('${tableColumn.default}'),`;
    }

    const seqType = sequelizeTypeHelper(tableColumn.type);
    if (seqType) {
      sequelizeColObj += `type: ${seqType},`;
    }

    if (tableColumn.reference) {
      sequelizeColObj += `references: { 
                  model: '${tableColumn.reference.tableName}',
                   key: '${tableColumn.reference.colName}'
                },`;
    }

    if (tableColumn.reference?.onDelete) {
      sequelizeColObj += `onDelete: '${tableColumn.reference.onDelete}',`;
    }

    if (tableColumn.reference?.onUpdate) {
      sequelizeColObj += `onDelete: '${tableColumn.reference.onUpdate}',`;
    }

    if (tableColumn.unique) {
      sequelizeColObj += 'unique: true,';
    }

    if (tableColumn.autoIncrement) {
      sequelizeColObj += 'autoIncrement: true,';
    }

    if (tableColumn.description) {
      sequelizeColObj += `comment: '${tableColumn.description}',`;
    }

    sequelizeColObj += `field: '${tableColumn.name}',`;

    sequelizeColObj += '}';
    return sequelizeColObj;
  }
}
