export const utilsTemplate = `
import type { Knex } from 'knex';
import { getKnex } from '../database/connectToDB';

const knex = getKnex()

export const customWhere = (
  qb: Knex.QueryBuilder,
  key?: string,
): Knex.QueryBuilder => {
  if (key) {
    return qb.andWhere({
      [key + '.deleted_at']: null,
    });
  }
  return qb.andWhere({
    deleted_at: null,
  });
};
  
export async function runTransaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T | undefined> {
  const transaction = await knex.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    console.error('Transaction failed:', error);
    return undefined;
  }
}

`;
