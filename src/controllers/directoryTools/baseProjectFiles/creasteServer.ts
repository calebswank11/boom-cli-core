import { ConfigRegistry } from '../../../registries';
import { graphqlExpressTemplate } from '../../../templates/server/graphql/graphqlExpress';
import { restExpressTemplate } from '../../../templates/server/rest/restExpress';
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
    serverTemplate = restExpressTemplate;
  }

  await fileCreator.createFile(
    `${config.root}/src/index.${config.project.type}`,
    serverTemplate,
  );
  console.log('-------------------------------');
  console.log(`✅ Server created at ./src`);
};
