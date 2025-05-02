import { LibrariesEnum, ORMEnum } from '../../../@types';
import { ConfigRegistry } from '../../../registries';
import {
  knexGraphqlTemplate,
  sequelizeGraphqlTemplate,
} from '../../../templates/server/graphql/graphqlExpress';
import {
  knexRestExpressTemplate,
  sequelizeRestExpressTemplate,
} from '../../../templates/server/rest/restExpress';
import { restNestJSTemplate } from '../../../templates/server/rest/restNestJS';
import { FileCreator } from '../FileCreator';

const configRegistry = ConfigRegistry.getConfigInstance();
const config = configRegistry.getConfig();

export const buildAndCreateServer = async () => {
  const fileCreator = new FileCreator();

  // Choose the appropriate template based on API type and ORM
  let serverTemplate = '';

  if (config.apiType === 'graphql') {
    switch (config.orm) {
      case ORMEnum.sequelize:
        serverTemplate = sequelizeGraphqlTemplate();
        break;
      case ORMEnum.knex:
        serverTemplate = knexGraphqlTemplate();
        break;
      default:
        throw new Error(`Unsupported ORM: ${config.orm}`);
    }
  } else {
    // For REST API
    switch (config.library) {
      case LibrariesEnum.express:
        switch (config.orm) {
          case ORMEnum.sequelize:
            serverTemplate = sequelizeRestExpressTemplate();
            break;
          case ORMEnum.knex:
            serverTemplate = knexRestExpressTemplate();
            break;
          default:
            throw new Error(`Unsupported ORM: ${config.orm}`);
      }
        break;
      case LibrariesEnum.nestjs:
        serverTemplate = restNestJSTemplate;
        break;
      default:
        throw new Error(`Unsupported library: ${config.library}`);
    }
  }

  await fileCreator.createFile(
    `${config.root}/src/index.${config.project.type}`,
    serverTemplate,
  );
  console.log('-------------------------------');
  console.log(`✅ Server created at ./src`);
};
