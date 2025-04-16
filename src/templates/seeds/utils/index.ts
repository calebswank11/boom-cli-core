export const seedsUtilsIndexTemplate = `
import type { Knex } from 'knex';

export const getRandomIdx = (array: any[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

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
