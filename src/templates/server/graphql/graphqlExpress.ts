export const sequelizeGraphqlTemplate = () =>
  graphqlExpressTemplate({
    imports: `
  import { Sequelize } from 'sequelize';
  import { initializeModels } from './models';
  `,
    initializeOrm: `
  // Initialize Sequelize
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'database',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: (process.env.DB_DIALECT as 'postgres') || 'postgres',
      logging: isDevelopment ? console.log : false,
    }
  );

  `,
    serverHelpers: `
  const modelsInitialized = await initializeModels();
  if (!modelsInitialized) {
    throw new Error('Failed to initialize models');
  }
  `,
  });

export const knexGraphqlTemplate = () =>
  graphqlExpressTemplate({
    imports: `import Knex from 'knex';
import knexConfig from '../knexfile';`,
    initializeOrm: `// Initialize Knex
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);`,
  });

export const graphqlExpressTemplate = ({
  imports,
  initializeOrm,
  serverHelpers,
}: {
  imports: string;
  initializeOrm: string;
  serverHelpers?: string;
}) => `
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import schema from './resolvers/schema';
${imports}

// Import Apollo Plugins
const {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} = require('apollo-server-core');

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

${initializeOrm}

// Production-specific Apollo configurations
const prodConfig = isDevelopment ? {} : { cache: 'bounded' };

// Initialize Apollo Server
const server = new ApolloServer({
  // @ts-ignore
  cache: undefined,
  schema,
  csrfPrevention: true,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ApolloServerPluginInlineTrace(),
  ],
  ...prodConfig,
});

// Start Apollo Server & Initialize Express
server.start().then(() => {
  const app = express();

  // Load environment variables in development
  if (isDevelopment) {
    const envPath = path.resolve(process.cwd(), \`.env.\${process.env.NODE_ENV || 'development'}\`);
    dotenv.config({ path: envPath });
  }

  // Middleware
  app.use(
    cors({ credentials: false, origin: '*' }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        try {
          const token = req.headers.authorization || req.headers.Authorization;
          return { expressRequest: req, expressResponse: res, token };
        } catch (error) {
          console.error({ key: 'ContextCreationFailed', error });
          throw new Error('Server initialization failed, please contact support');
        }
      },
    })
  );

  // Start Server
  const PORT = process.env.PORT || 4000;

  const startServer = async () => {
    ${serverHelpers || ''}
    app.listen(PORT, () => {
      console.log(\`🚀 Server running at http://localhost:\${PORT}/graphql\`);
    });
  }

  startServer();
});

`;
