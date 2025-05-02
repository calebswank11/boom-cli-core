import {
  RelationshipType,
  TableColumnIndexes,
  TableStructureBase,
  TemplateToBuild
} from '../../../@types';
import {
  parseDefaultValue,
  sequelizeTypeHelper,
} from '../../../helpers/builderHelpers/sequelizeTypeHelper';
import { pascalToCamel } from '../../../utils/stringUtils';

export class SequelizeModelBuilder {
  static build(tables: TableStructureBase[]): TemplateToBuild[] {
    // First, create a map of table names to their models for relationship references
    const tableModelMap = new Map<string, string>();
    tables.forEach((table) => {
      tableModelMap.set(table.name, `${table.pascalCase}Model`);
    });

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
          modelObj += `defaultValue: ${parseDefaultValue(column.default, column.enumValues)},\n`;
        }

        if (column.reference && column.reference.tableName) {
          modelObj += `references: {
            model: '${column.reference.tableName}',
            key: '${column.reference.colName}'
          },`;
        }

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

      // Generate relationship associations
      const { imports, associations } = this.generateAssociations(
        table,
        tableModelMap,
      );

      return {
        template: `
        import {Sequelize, DataTypes} from 'sequelize';
        import { getSequelize } from '../database/connectToDB';
        ${this.generateImportStatements(imports)}
        const sequelize = getSequelize();

        export const ${modelName} = sequelize.define('${modelName}', {${modelAttributes.join(',\n')}}, ${JSON.stringify(modelConfig, null, 2)});

        /* Define associations
         ${associations}
         */
        `,
        path: `${table.camelCase}`,
      };
    });

    // sequelize.define('YourModel', attributes, modelConfig);
  }

  /**
   * Generates Sequelize association code based on table relationships
   */
  private static generateAssociations(
    table: TableStructureBase,
    tableModelMap: Map<string, string>,
  ): { imports: string[]; associations: string } {
    if (!table.relationships || table.relationships.length === 0) {
      return { imports: [], associations: '' };
    }
    const imports: string[] = [];
    const associations: string[] = [];

    table.relationships.forEach((relationship) => {
      const targetModelName = tableModelMap.get(relationship.targetTable);
      if (!targetModelName) return;

      switch (relationship.type) {
        case RelationshipType.ONE_TO_ONE:
          imports.push(`${targetModelName}`);
          associations.push(
            `${table.pascalCase}Model.belongsTo(${targetModelName}, {
              foreignKey: '${relationship.sourceColumn}',
              as: '${relationship.navigationPropertySource}',
              onDelete: '${relationship.onDelete || 'NO ACTION'}',
              onUpdate: '${relationship.onUpdate || 'NO ACTION'}'
            });`,
          );
          break;

        case RelationshipType.ONE_TO_MANY:
          imports.push(`${targetModelName}`);
          associations.push(
            `${table.pascalCase}Model.hasMany(${targetModelName}, {
              foreignKey: '${relationship.sourceColumn}',
              as: '${relationship.navigationPropertySource}',
              onDelete: '${relationship.onDelete || 'NO ACTION'}',
              onUpdate: '${relationship.onUpdate || 'NO ACTION'}'
            });`,
          );
          break;

        case RelationshipType.MANY_TO_ONE:
          imports.push(`${targetModelName}`);
          associations.push(
            `${table.pascalCase}Model.belongsTo(${targetModelName}, {
              foreignKey: '${relationship.sourceColumn}',
              as: '${relationship.navigationPropertySource}',
              onDelete: '${relationship.onDelete || 'NO ACTION'}',
              onUpdate: '${relationship.onUpdate || 'NO ACTION'}'
            });`,
          );
          break;

        case RelationshipType.MANY_TO_MANY:
          imports.push(`${targetModelName}`);
          if (relationship.junctionTable) {
            const junctionTableName = relationship.junctionTable;
            associations.push(
              `${table.pascalCase}Model.belongsToMany(${targetModelName}, {
                through: '${junctionTableName}',
                foreignKey: '${relationship.sourceColumn}',
                otherKey: '${relationship.targetColumn}',
                as: '${relationship.navigationPropertySource}'
              });`,
            );
          }
          break;
      }
    });

    return { imports, associations: associations.join('\n\n') };
  }

  private static generateImportStatements(imports: string[]): string {
    if (imports.length === 0) return '';

    const uniqueImports = [...new Set(imports)];
    return uniqueImports
      .map((importName) => {
        // Import from the same directory level
        return `import { ${importName} } from './${pascalToCamel(importName.replace('Model', ''))}';`;
      })
      .join('\n');
  }
}
