import { ORMEnum } from '../../../@types';

export const seedsUtilsIndexTemplate = (orm: ORMEnum) => {
  switch (orm) {
    case ORMEnum.knex:
      return knexUtilsIndexTemplate;
    case ORMEnum.sequelize:
      return sequelizeUtilsIndexTemplate;
  }
};

const universalHelpers = `
export const getRandomIdx = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};
`;

export const knexUtilsIndexTemplate = `
import type { Knex } from 'knex';

${universalHelpers}

export const shouldSeedData = async (
  knex: Knex,
  table = 'myTable',
) => {
  const existingDataCount = await knex(table).count();
  return !(
    existingDataCount[0].count &&
    Number(existingDataCount[0].count) !== 0
  );
};
`;

const sequelizeUtilsIndexTemplate = `
import { QueryInterface } from 'sequelize';

${universalHelpers}

export async function shouldSeedData(queryInterface: QueryInterface, table: string) {
  const [results] = await queryInterface.sequelize.query(\`SELECT COUNT(*) as count FROM "\${table}"\`);
  return Number(results[0].count) === 0;
}

export async function seedTable(queryInterface: QueryInterface, table: string, rows: any[]) {
  if (await shouldSeedData(queryInterface, table)) {
    await queryInterface.bulkInsert(table, rows);
  }
}
`;
