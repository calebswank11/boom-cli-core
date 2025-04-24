import { ORMEnum } from '../../../@types';

export const migrationUtilsTemplates = (orm: ORMEnum) => {
  switch (orm) {
    case ORMEnum.knex:
      return knexMigrationUtilsTemplates;
    case ORMEnum.sequelize:
  }
};

// These are universal to Postgres but will change with different db's, need to keep that in mind
const universalHelpers = `
export const ON_UPDATE_TIMESTAMP_FUNCTION = \`
  CREATE OR REPLACE FUNCTION on_update_timestamp()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
  $$ language 'plpgsql';
\`;
export const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = \`DROP FUNCTION on_update_timestamp\`;
`;

export const knexMigrationUtilsTemplates = `
import type { Knex } from 'knex';

export const buildDefaults = (
  knex: Knex,
  table: Knex.CreateTableBuilder,
  buildTableCols?: Function
) => {
  table.uuid('id')
  .primary()
  .defaultTo(knex.raw('uuid_generate_v4()'))
  .notNullable()
  .index();
  if(buildTableCols)
    buildTableCols();
  table
    .timestamp('created_at', { useTz: true })
    .defaultTo(knex.fn.now());
  table
    .timestamp('updated_at', { useTz: true })
    .defaultTo(knex.fn.now());
  table.timestamp('deleted_at', { useTz: true });
};

${universalHelpers}
`;

const sequelizeMigrationUtilsTemplates = `
import { QueryInterface, DataTypes } from 'sequelize';

const defaultTableStructure = (colsToInject: Record<string, any>) => {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  ...colsToInject,
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  deleted_at: {
    type: DataTypes.DATE,
  }
}

export const buildDefaults = (queryInterface: QueryInterface, tableName: string, colsToInject?: Record<string, any>) => {
  return queryInterface.createTable(tableName, defaultTableStructure(colsToInject));
} 
 
${universalHelpers}
`;

const prismaMigrationUtilsTemplates = `

${universalHelpers}
`;

const typeORMMigrationUtilsTemplates = `


${universalHelpers}
`;
