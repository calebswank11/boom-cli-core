import fs from 'fs';
import path from 'path';
import { CLIOptions } from '../@types';

export async function loadConfigAndMerge(options: CLIOptions): Promise<CLIOptions> {
  const configPath = path.resolve(
    process.cwd(),
    options.config || path.join(process.cwd(), 'scaffold.config.json'),
  );
  let configData = {};

  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    configData = JSON.parse(raw);
  }

  return {
    ...configData,
    ...options,
    interactive: options.interactive !== false,
  };
}
