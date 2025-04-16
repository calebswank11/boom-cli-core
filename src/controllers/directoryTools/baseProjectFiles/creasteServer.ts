import { ConfigRegistry } from '../../../registries';
import { FileCreator } from '../FileCreator';
import { graphqlExpressTemplate } from '../../../templates/server/graphql/graphqlExpress';

const configRegistry = ConfigRegistry.getConfigInstance();
const config = configRegistry.getConfig();

export const buildAndCreateServer = async () => {
  const fileCreator = new FileCreator();
  await fileCreator.createFile(
    `${config.root}/src/index.${config.project.type}`,
    graphqlExpressTemplate,
  );
  console.log('-------------------------------');
  console.log(`✅ Server created at ./src`);
};
