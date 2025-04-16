export const graphqlExpressTemplate = `
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import Knex from 'knex';
import schema from './resolvers/schema';
import knexConfig from '../knexfile';

// Import Apollo Plugins
const {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginInlineTrace,
} = require('apollo-server-core');

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Initialize Knex
const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);

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
  app.listen(PORT, () => {
    console.log(\`🚀 Server running at http://localhost:\${PORT}/graphql\`);
  });
});

`;
