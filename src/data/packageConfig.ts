import { PackageRegistryBase } from '../@types';

const scripts = {
  library: {
    ts: {
      start: 'node dist/index.js',
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
    },
    js: {
      start: 'node index.js',
      dev: 'nodemon index.js',
    },
    general: {
      test: 'jest',
    },
  },
  orm: {
    knex: {
      migrate: 'knex migrate:latest',
      rollback: 'knex migrate:rollback',
      seed: 'knex seed:run',
    },
    sequelize: {
      migrate: 'sequelize db:migrate',
      rollback: 'sequelize db:migrate:undo',
      seed: 'sequelize db:seed:all',
    },
    typeorm: {},
    prisma: {},
  },
};

const dependencies = {
  general: {
    dotenv: 'latest',
    cors: 'latest',
  },
  api: {
    type: {
      graphql: {
        graphql: '^16.6.0',
        'apollo-server-express': '^3.10.2',
        '@apollo/server': 'latest',
      },
    },
    handler: {
      general: {},
      apollo: {},
    },
  },
  library: {
    general: {
      express: '^4.18.2',
    },
    express: {
      express: '^4.18.2',
    },
  },
  orm: {
    general: {
      pg: '^8.11.3',
      mysql2: '^3.6.0',
      sqlite3: '^5.1.6',
    },
    knex: {
      knex: '^2.5.1',
    },
    sequelize: {
      sequelize: '^6.31.0',
    },
    typeorm: {},
    prisma: {},
  },
};

const devDependencies = {
  general: {
    nodemon: '^2.0.22',
    jest: '^29.6.2',
    eslint: 'latest',
    prettier: 'latest',
    '@faker-js/faker': '9.6.0',
    ts: {
      typescript: '^5.3.3',
      'ts-node': '^10.9.1',
      'ts-node-dev': '^2.0.0',
      '@types/node': '^20.11.28',
      '@types/jest': 'latest',
    },
  },
  api: {
    type: {
      graphql: {
        ts: {
          '@types/express': '^4.17.21',
        },
      },
    },
    handler: {
      apollo: {
        general: {},
        ts: {},
      },
    },
  },
  library: {
    express: {
      ts: {
        '@types/express': '^4.17.21',
      },
    },
  },
  orm: {
    knex: {
      ts: {
        '@types/knex': '^0.16.2',
      },
    },
    sequelize: {
      ts: {
        '@types/sequelize': '^4.28.14',
        'sequelize-cli': '^6.6.1',
      },
      js: { 'sequelize-cli': '^6.6.1' },
    },
    typeorm: {},
    prisma: {},
  },
};

export const packageJsonConfig: PackageRegistryBase = {
  scripts,
  dependencies,
  devDependencies,
};
