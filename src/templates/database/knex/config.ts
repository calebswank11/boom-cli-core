export const knexDBConfigTemplate = `
import type { Knex } from 'knex';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql', // Change to 'mysql' or 'sqlite3' if needed
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'your_user',
      password: process.env.DB_PASS || 'your_password',
      database: process.env.DB_NAME || 'your_database',
      port: Number(process.env.DB_PORT) || 5432, // Default PostgreSQL port
    },
    pool: { min: 2, max: 10 }, // Connection pooling
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/dev',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 5432,
      ssl: { rejectUnauthorized: false }, // Enable SSL for cloud databases
    },
    pool: { min: 5, max: 20 }, // Adjust for better performance
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/prod',
    },
  }
};

export default config;

`;
