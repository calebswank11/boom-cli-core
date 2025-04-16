import {
  MigrationsRegistryBase,
  ORM,
  SqlDataType,
  TableStructureByFile,
} from '../@types';
import { snakeToCamel } from '../utils/stringUtils';
import { MigrationFactory } from '../factories/migrations/MigrationFactory';

const getDefaultValue = (toDefault: string, asString?: boolean) => {
  if (toDefault === 'FALSE' || toDefault === 'NULL' || toDefault === 'TRUE') {
    return toDefault.toLowerCase();
  }
  if (toDefault === 'NOW()') return `knex.raw('NOW()')`;
  if (toDefault.toLowerCase() === 'null') {
    return `null`;
  }
  return asString ? `'${toDefault}'` : toDefault;
};

export function buildMigrationsData(
  tableStructureByFile: TableStructureByFile,
  orm: ORM,
) {
  const migrationRegistryData: MigrationsRegistryBase[] = [];
  const fileNames = Object.keys(tableStructureByFile);
  const migrationFactory = MigrationFactory.getMigrationFactory(orm);

  fileNames.forEach((fileName) => {
    const migrations: {
      tablesToCreate: string[];
      tablesToDrop: string[];
      enumsToCreate: string[];
      enumsToImport: string[];
    } = {
      tablesToCreate: [],
      tablesToDrop: [],
      enumsToCreate: [],
      enumsToImport: [],
    };
    // process individual file
    tableStructureByFile[fileName].map((tableStructure) => {
      // process individual table
      const migration = {
        tableToCreate: `await knex.schema.createTable('${tableStructure.name}', (table: Knex.CreateTableBuilder) => {\n
            buildDefaults(knex, table, () => {\n`,
      };
      Object.values(tableStructure.columns)
        .filter(
          (tableColumn) =>
            !['created_at', 'id', 'deleted_at', 'updated_at'].includes(
              tableColumn.name,
            ),
        )
        .map((tableColumn) => {
          // process columns
          const knexLines: string[] = [`table`];

          if (tableColumn.enumValues) {
            knexLines.push(
              `.enum('${tableColumn.name}', ${tableColumn.type.enumName}, ${snakeToCamel(`${tableStructure.name}_${tableColumn.name}_meta`)})`,
            );
            if (tableColumn.type.enumName) {
              migrations.enumsToCreate.push(
                `${snakeToCamel(`${tableStructure.name}_${tableColumn.name}_meta`)}`,
              );
              migrations.enumsToImport.push(tableColumn.type.enumName);
            }
          } else {
            // root table column I.E .uuid(my_column_name)
            const migrationLine = migrationFactory.getMigrationLine(
              tableColumn.type,
              tableColumn.name,
            );
            knexLines.push(migrationLine);
          }

          if (tableColumn.primary) {
            knexLines.push('.primary()');
          }
          if (tableColumn.unique) {
            knexLines.push('.unique()');
          }
          if (!tableColumn.nullable) {
            knexLines.push('.notNullable()');
          }
          if (tableColumn.default) {
            switch (tableColumn.type.name) {
              case SqlDataType.DATE:
              case SqlDataType.TIME:
              case SqlDataType.TIMESTAMP:
              case SqlDataType.TIMESTAMPTZ:
                knexLines.push(
                  `.defaultTo(${getDefaultValue(tableColumn.default)})`,
                );
                break;
              case SqlDataType.UUID:
              case SqlDataType.CHAR:
              case SqlDataType.JSON:
              case SqlDataType.JSONB:
              case SqlDataType.TEXT:
              case SqlDataType.VARCHAR:
                knexLines.push(
                  `.defaultTo(${getDefaultValue(tableColumn.default, true)})`,
                );
                break;
              case SqlDataType.ENUM:
                knexLines.push(
                  `.defaultTo(${getDefaultValue(tableColumn.default, true).replace(/ /g, '_')})`,
                );
                break;
              default:
                knexLines.push(
                  `.defaultTo(${getDefaultValue(tableColumn.default)})`,
                );
            }
          }
          if (tableColumn.reference) {
            knexLines.push(
              `.references('${tableColumn.reference.colName}').inTable('${tableColumn.reference.tableName}')`,
            );
            if (tableColumn.reference.onDelete) {
              knexLines.push(`.onDelete('${tableColumn.reference.onDelete}')`);
            }
            if (tableColumn.reference.onUpdate) {
              knexLines.push(`.onUpdate('${tableColumn.reference.onUpdate}')`);
            }
          }
          knexLines.push(`;\n`);
          migration.tableToCreate += knexLines.join('\n');
        });

      migration.tableToCreate += `});\n});\n\n`;
      migrations.tablesToCreate.push(migration.tableToCreate);
      migrations.tablesToDrop.push(tableStructure.name);
    });
    // @ts-ignore
    migrationRegistryData.push({ name: fileName, migrations });
  });
  return migrationRegistryData;
}
