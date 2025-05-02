import { LibrariesEnum, Library, ORM, ORMEnum } from '../../@types';

export const utilsTemplate = (orm: ORM) => {
  switch (orm) {
    case ORMEnum.sequelize:
      return sequelizeUtilsTemplate;
      case ORMEnum.knex:
        return knexUtilsTemplate;
      case ORMEnum.prisma:
        return prismaUtilsTemplate;
      case ORMEnum.typeorm:
        return typeORMUtilsTemplate;
  }
};

const knexUtilsTemplate = `
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
`

const sequelizeUtilsTemplate = `
import {Transaction} from 'sequelize';
import { getSequelize } from '../database/connectToDB';

const sequelize = getSequelize() 

export async function runTransaction<T>(fn: (trx: Transaction) => Promise<T>): Promise<T> {
  const trx = await sequelize.transaction();
  try {
    const result = await fn(trx);
    await trx.commit();
    return result;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
`;

const prismaUtilsTemplate = ``;
const typeORMUtilsTemplate = ``;
