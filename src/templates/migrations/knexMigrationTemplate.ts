import { MigrationsBase } from '../../@types';

const baseEnumObject = (enumName: string) => `
  const ${enumName} = {
    useNative: true,
    enumName: '${enumName}_enum',
  };
  `;

export const knexMigrationsTemplate = ({
  tablesToCreate,
  enumsToCreate,
  tablesToDrop,
  enumsToImport,
  enumPath,
  name,
}: MigrationsBase & { enumPath: string; name: string }) => `
import type { Knex } from 'knex';
import {
  buildDefaults,
  DROP_ON_UPDATE_TIMESTAMP_FUNCTION,
  ON_UPDATE_TIMESTAMP_FUNCTION,
} from './utils';
import {
  ${enumsToImport.map((enumToImport) => enumToImport).join(', \n')}
} from '${enumPath}'

exports.up = async function (knex: Knex) {
  console.log('migrating ${name}');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
  
  ${enumsToCreate.map((e) => baseEnumObject(e)).join('')}
  
  ${tablesToCreate.join('\n')}
}

exports.down = async function (knex: Knex) {
  await knex.schema
    ${tablesToDrop.map((table) => `.dropTableIfExists('${table}')`).join('\n')};
  knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
};
`;
