import {
  MigrationsRegistryBase,
  ORM,
  ORMEnum,
  SqlDataType,
  TableColumnIndexes,
  TableStructureBase,
  TableStructureByFile,
} from '../@types';
import { MigrationFactory } from '../factories/migrations/MigrationFactory';
import {
  KnexMigrationFactory,
  SequelizeMigrationFactory,
} from '../factories/migrations/node';
import { snakeToCamel } from '../utils/stringUtils';

type MigrationsObject = {
  tablesToCreate: string[];
  tablesToDrop: string[];
  enumsToCreate: string[];
  enumsToImport: string[];
};

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
  const migrationBuilder = getMigrationBuilder(orm);

  // const migrationBuilder = getMigrationBuilder();

  fileNames.forEach((fileName) => {
    const migrations: MigrationsObject = {
      tablesToCreate: [],
      tablesToDrop: [],
      enumsToCreate: [],
      enumsToImport: [],
    };
    // process individual file
    tableStructureByFile[fileName].map((tableStructure) => {
      migrationBuilder(tableStructure, migrations);
    });
    // @ts-ignore
    migrationRegistryData.push({ name: fileName, migrations });
  });
  return migrationRegistryData;
}

const knexMigrationBuilder = (
  tableStructure: TableStructureBase,
  migrations: MigrationsObject,
) => {
  const migrationFactory = MigrationFactory.getMigrationFactory(
    ORMEnum.knex,
  ) as typeof KnexMigrationFactory;
  // process individual table
  const migration = {
    tableToCreate: `await knex.schema.createTable('${tableStructure.name}', (table: Knex.CreateTableBuilder) => {\n
            buildDefaults(knex, table, () => {\n`,
  };
  Object.values(tableStructure.columns)
    .filter(
      (tableColumn) =>
        !['created_at', 'id', 'deleted_at', 'updated_at'].includes(tableColumn.name),
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
            knexLines.push(`.defaultTo(${getDefaultValue(tableColumn.default)})`);
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
            knexLines.push(`.defaultTo(${getDefaultValue(tableColumn.default)})`);
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
};

const sequelizeMigrationBuilder = (
  tableStructure: TableStructureBase,
  migrations: MigrationsObject,
) => {
  const columns = Object.values(tableStructure.columns);
  const migrationFactory = MigrationFactory.getMigrationFactory(
    ORMEnum.sequelize,
  ) as typeof SequelizeMigrationFactory;
  const migration: {
    tableToCreate: string;
    enumsToCreate: string[];
    enumsToImport: string[];
  } = {
    tableToCreate: `await queryInterface.createTable('${tableStructure.name}', {\n`,
    enumsToCreate: [],
    enumsToImport: [],
  };
  const lines: string[] = [];
  columns.map((tableColumn) => {
    if (tableColumn.enumValues) {
      migration.enumsToCreate.push(
        `CREATE TYPE "${tableColumn.type.enumName}" AS ENUM (${(tableColumn.enumValues || []).map((value) => `'${value}'`).join(',')})`,
      );
      if (tableColumn.type.enumName) {
        migrations.enumsToImport.push(tableColumn.type.enumName);
      }
    }
    lines.push(migrationFactory.getMigrationLine(tableColumn));
  });

  const colIndexes = columns
    .map((col) => col.indexes)
    .flat()
    .filter((idx) => idx) as TableColumnIndexes[];

  const tableConfig = {
    tableName: tableStructure.name,
    timestamps: true,
    paranoid: tableStructure.softDelete?.enabled ?? true,
    underscored: true,
    freezeTableName: true,
    ...(tableStructure.description ? { comment: tableStructure.description } : {}),
    indexes: Array.isArray(colIndexes)
      ? colIndexes.map((def) => ({
          name: def.name,
          fields: def.columns,
          unique: !!def.unique,
          ...(def.method ? { using: def.method } : {}),
        }))
      : [],
  };

  migration.tableToCreate += lines.join(',\n');
  migration.tableToCreate += `}, ${JSON.stringify(tableConfig, null, 2)});\n`;
  migrations.tablesToCreate.push(migration.tableToCreate);
  migrations.enumsToCreate.push(...migration.enumsToCreate);
  migrations.enumsToImport.push(...migration.enumsToImport);
  migrations.tablesToDrop.push(tableStructure.name);
};

const typeormMigrationBuilder = (
  tableStructure: TableStructureBase,
  migrations: MigrationsObject,
) => {
  const migrationFactory = MigrationFactory.getMigrationFactory(ORMEnum.typeorm);
};

const prismaMigrationBuilder = (
  tableStructure: TableStructureBase,
  migrations: MigrationsObject,
) => {
  const migrationFactory = MigrationFactory.getMigrationFactory(ORMEnum.prisma);
};

const getMigrationBuilder = (orm: ORMEnum) => {
  switch (orm) {
    case ORMEnum.knex:
      return knexMigrationBuilder;
    case ORMEnum.sequelize:
      return sequelizeMigrationBuilder;
    case ORMEnum.typeorm:
      return typeormMigrationBuilder;
    case ORMEnum.prisma:
      return prismaMigrationBuilder;
  }
};
