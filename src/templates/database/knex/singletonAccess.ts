export const knexSingletonDBTemplate = `
  import knex, { Knex } from 'knex';
  import dbConfig from '../config/knex';
  
  class KnexSingleton {
    private static instance?: Knex;
  
    private constructor() {}
  
    public static getInstance(): Knex {
      if (!KnexSingleton.instance) {
        KnexSingleton.instance = knex(dbConfig[process.env.NODE_ENV || 'development']);
      }
      return KnexSingleton.instance;
    }
  
    public static async destroy(): Promise<void> {
      if (KnexSingleton.instance) {
        const instance = KnexSingleton.instance;
        KnexSingleton.instance = undefined;
        await instance.destroy();
      }
    }
  }

  
  export const getKnex = (): Knex => KnexSingleton.getInstance();
`;
