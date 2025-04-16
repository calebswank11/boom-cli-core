export const sequelizeSingletonDBTemplate = `
  import { Sequelize } from 'sequelize';
  import config from '../config/sequelize'; // Adjust path based on your setup
  
  class SequelizeSingleton {
    private static instance?: Sequelize;
  
    private constructor() {}
  
    public static getInstance(): Sequelize {
      if (!SequelizeSingleton.instance) {
        const env = process.env.NODE_ENV || 'development';
        SequelizeSingleton.instance = new Sequelize(config[env]);
      }
      return SequelizeSingleton.instance;
    }
  
    public static async close(): Promise<void> {
      if (SequelizeSingleton.instance) {
        const instance = SequelizeSingleton.instance;
        SequelizeSingleton.instance = undefined; // Prevent new queries while closing
        await instance.close();
      }
    }
  }
  
  export const getSequelize = (): Sequelize => SequelizeSingleton.getInstance();
`;
