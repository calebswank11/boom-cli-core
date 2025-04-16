export const knexORMTemplate = (types: [tsType: string, tableName: string][]) => {
  const compositeBase = (typeName: string, tableName: string) => `
    ${tableName}: k.CompositeTableType<
      ${typeName}, // fetch
      Partial<${typeName}>, // create
      Partial<Omit<${typeName}, 'created_at'>> // update
    >
  `;

  return `
  import { Knex as k } from 'knex';
  import {
    ${types.map(([tsType]) => tsType).join(', ')}
  } from './index'
  
  declare module 'knex/types/tables' {
    interface Tables {
      ${types.map(([tsType, tableName]) => compositeBase(tsType, tableName)).join('\n')} 
    }
  }
  `;
}
