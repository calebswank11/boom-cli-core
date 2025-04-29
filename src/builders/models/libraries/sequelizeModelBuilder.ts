import {
  TableColumnIndexes,
  TableStructureBase,
  TemplateToBuild,
} from '../../../@types';
import { sequelizeTypeHelper } from '../../../helpers/builderHelpers/sequelizeTypeHelper';

export class SequelizeModelBuilder {
  static build(tables: TableStructureBase[]): TemplateToBuild[] {
    return tables.map((table) => {
      const tableColumns = Object.values(table.columns);
      const modelName = `${table.pascalCase}Model`;
      const modelAttributes = tableColumns.map((column) => {
        const key = column.name;
        let modelObj = `${key}: {\n`;

        if (column.enumValues) {
          modelObj += `type: DataTypes.ENUM('${column.enumValues.join("','")}'),\n`;
        } else {
          modelObj += `type: ${sequelizeTypeHelper(column.type)},\n`;
        }

        if (column.nullable) {
          modelObj += `allowNull: ${column.nullable},\n`;
        }

        if (column.primary) {
          modelObj += `primaryKey: ${column.primary},\n`;
        }

        if (column.unique) {
          modelObj += `unique: ${column.unique},\n`;
        }

        if (column.default) {
          modelObj += `defaultValue: Sequelize.literal('${column.default}'),\n`;
        }

        if (column.reference && column.reference.tableName) {
          modelObj += `references: {
            model: '${column.reference.tableName}',
            key: '${column.reference.colName}'
          },`;
        }

        console.log(column.reference);

        modelObj += `field: '${column.name}',\n`;

        modelObj += `\n}`;

        return modelObj;
      });

      const colIndexes = tableColumns
        .map((col) => col.indexes)
        .flat()
        .filter((idx) => idx) as TableColumnIndexes[];

      const indexes = Array.isArray(colIndexes)
        ? colIndexes.map((def) => ({
            name: def.name,
            fields: def.columns,
            unique: !!def.unique,
            ...(def.method ? { using: def.method } : {}),
          }))
        : [];

      const modelConfig = {
        tableName: table.name,
        freezeTableName: true,
        timestamps: true,
        paranoid: true,
        underscored: true,
        comment: table.description,
        indexes,
      };

      return {
        template: `
        import {Sequelize, DataTypes} from 'sequelize';
        import { getSequelize } from '../../database/connectToDB';
         
         const sequelize = getSequelize();
         
        export const ${modelName} = sequelize.define('${modelName}', {${modelAttributes.join(',\n')}}, ${JSON.stringify(modelConfig, null, 2)});
          
        `,
        path: `${table.camelCase}`,
      };
    });

    // sequelize.define('YourModel', attributes, modelConfig);
  }
}
