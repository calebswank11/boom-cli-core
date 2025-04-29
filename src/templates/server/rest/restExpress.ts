export const restExpressTemplate = `
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import routes from './routes';

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

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

// Initialize Express
const app = express();

// Load environment variables in development
if (isDevelopment) {
  const envPath = path.resolve(process.cwd(), \`.env.\${process.env.NODE_ENV || 'development'}\`);
  dotenv.config({ path: envPath });
}

// Middleware
app.use(cors({ credentials: false, origin: '*' }));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 4000;

// Test database connection and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(\`🚀 Server running at http://localhost:\${PORT}/api\`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
`;
