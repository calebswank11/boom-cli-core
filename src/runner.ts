import { runInteractivePrompts } from './prompts/interactive';
import { loadConfigAndMerge } from './config/loadConfig';
import { CLIOptions } from './@types';
import { boomScaffold } from './entry';
import { buildConfig } from './config/buildConfig';

async function runBoomCLI(options: CLIOptions) {
  // NOTE will need to adjust this for new configs, maybe they just delete it and start fresh? Idk.
  const mergedConfig = await loadConfigAndMerge(options);

  const finalOptions = mergedConfig.interactive
    ? await runInteractivePrompts(mergedConfig)
    : mergedConfig;

  const config = await buildConfig(finalOptions);

  await boomScaffold(config);
}

export default runBoomCLI;
