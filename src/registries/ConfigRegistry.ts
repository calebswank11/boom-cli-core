import fs from 'fs';
import { ScaffoldingConfig } from '../@types';
import { genericScaffoldingConfig } from '../data/scaffoldingConfig';
import dotenv from 'dotenv';
import path from 'path';
import { categorizeFolders } from '../utils/folderUtils';

dotenv.config();
export class ConfigRegistry {
  private static configInstance: ConfigRegistry;
  private config: ScaffoldingConfig;
  private fileStoragePaths: Record<string, string>;
  private categorizedFolders: Record<string, string[]> | undefined = undefined;

  constructor() {
    this.config = this.loadConfigFromFile() || this.defaultConfig();
    this.fileStoragePaths = this.getFileStoragePaths();
  }

  static getConfigInstance(): ConfigRegistry {
    if (!ConfigRegistry.configInstance) {
      ConfigRegistry.configInstance = new ConfigRegistry();
    }
    return ConfigRegistry.configInstance;
  }

  getFileStoragePaths() {
    return Object.fromEntries(
      Object.entries(process.env)
        .filter(([key]) => key.endsWith('_REGISTRY_PATH'))
        .map(([key, filePath]) => {
          // extensible to various envs
          const pathToUse = path.join(
            process.cwd(),
            `${this.config.srcRoot}/data/registryData/${filePath}`,
          );
          return [key, pathToUse];
        }),
    );
  }

  getRegistryDataPath(name: string): string | undefined {
    return this.fileStoragePaths[name];
  }

  private loadConfigFromFile(): ScaffoldingConfig | null {
    const CONFIG_PATH = this.fileStoragePaths
      ? this.fileStoragePaths.CONFIG_REGISTRY_PATH
      : path.join(process.cwd(), 'scaffold.config.json');
    if (fs.existsSync(CONFIG_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading config file:', error);
      }
    }
    return null;
  }

  private defaultConfig(): ScaffoldingConfig {
    return genericScaffoldingConfig;
  }

  getConfig(): ScaffoldingConfig {
    return this.config;
  }

  addConfig(config: ScaffoldingConfig) {
    this.config = config;
    this.saveConfigToFile();
  }

  updateConfig(updates: Partial<ScaffoldingConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfigToFile();
  }

  private saveConfigToFile() {
    const CONFIG_PATH = this.fileStoragePaths.CONFIG_REGISTRY_PATH;
    const rootRegistryDataPath = path.join(
      process.cwd(),
      `${this.config.srcRoot}/data/registryData`,
    );
    if (!fs.existsSync(rootRegistryDataPath)) {
      fs.mkdirSync(rootRegistryDataPath, { recursive: true });
      console.log(`✅ Folder created: ${rootRegistryDataPath}`);
    } else {
      console.log(`📁 Folder already exists: ${rootRegistryDataPath}`);
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.config, null, 2));
  }

  setCategorizedFolders(tableNames: string[]) {
    this.categorizedFolders = categorizeFolders(tableNames);
  }
  getCategorizedFolders() {
    return this.categorizedFolders;
  }
}
