import { boomScaffold } from './entry';
import { ConfigRegistry } from './registries';

(async () => {
  const configRegistry = ConfigRegistry.getConfigInstance();
  const config = configRegistry.getConfig();
  await boomScaffold(config);
})();
