export const migrationUtilsTemplates = `
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

`
