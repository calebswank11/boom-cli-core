import { MigrationsBase } from '../../@types';

const baseEnumObject = (enumName: string) => `
  await queryInterface.sequelize.query(\`CREATE TYPE "${enumName}_enum" AS ENUM (\${${enumName}.map(val => \`\${val}\`).join(',')})\`)
`;

export const sequelizeMigrationsTemplate = ({
  tablesToCreate,
  enumsToCreate,
  tablesToDrop,
  enumsToImport,
  enumPath,
  name,
}: MigrationsBase & { enumPath: string; name: string }) => `
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';
import {
  buildDefaults,
  DROP_ON_UPDATE_TIMESTAMP_FUNCTION,
  ON_UPDATE_TIMESTAMP_FUNCTION,
} from './utils';
import {
  ${enumsToImport.map((enumToImport) => enumToImport).join(', \n')}
} from '${enumPath}'

export default {
  async up(queryInterface: QueryInterface) {
    console.log('Migrating ${name}');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryInterface.sequelize.query(ON_UPDATE_TIMESTAMP_FUNCTION);

    ${enumsToImport.map((e) => baseEnumObject(e)).join(' ')}

    ${tablesToCreate.join('\n')}

  },
  async down(queryInterface: QueryInterface) {
    ${tablesToDrop.map((table) => `await queryInterface.dropTable('${table}');`).join('\n')}
    ${enumsToCreate.map((e) => `await queryInterface.sequelize.query(\`DROP TYPE IF EXISTS "${e}_enum";\`);`).join('')}

  }
}

`;
