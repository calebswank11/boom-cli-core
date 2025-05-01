import { LibrariesEnum } from '../../../@types';
import { ConfigRegistry } from '../../../registries';
import { graphqlExpressTemplate } from '../../../templates/server/graphql/graphqlExpress';
import { restExpressTemplate } from '../../../templates/server/rest/restExpress';
import { restNestJSTemplate } from '../../../templates/server/rest/restNestJS';
import { FileCreator } from '../FileCreator';

const configRegistry = ConfigRegistry.getConfigInstance();
const config = configRegistry.getConfig();

export const buildAndCreateServer = async () => {
  const fileCreator = new FileCreator();

  // Choose the appropriate template based on API type and ORM
  let serverTemplate = '';

  if (config.apiType === 'graphql') {
    serverTemplate = graphqlExpressTemplate;
  } else {
    // For REST API
    switch (config.library) {
      case LibrariesEnum.express:
        serverTemplate = restExpressTemplate;
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
