export const sequelizeDBConfigTemplate = `
  import { Options } from 'sequelize';
  import dotenv from 'dotenv';

  // Load environment variables from .env
  dotenv.config();
  
  const config: { [key: string]: Options } = {
    development: {
      dialect: process.env.DB_DIALECT || 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: false,
    },
    production: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      logging: false,
    },
  };
  
  export default config;
`;
