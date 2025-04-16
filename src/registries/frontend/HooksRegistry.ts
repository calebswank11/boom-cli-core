import fs from 'fs';
import { ConfigRegistry } from '../ConfigRegistry';
import { ClientAPIHookData, TemplateToBuild } from '../../@types';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';
import path from 'path';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';

export class HooksRegistry extends ConfigRegistry {
  private static instance: HooksRegistry;
  private hooks: ClientAPIHookData[];
  private HOOKS_PATH: string = './hooks.json';

  private constructor() {
    super();
    this.hooks = this.loadFromFile() || this.defaultHooks();
    this.HOOKS_PATH =
      this.getRegistryDataPath('HOOKS_REGISTRY_PATH') || './hooks.json';
  }

  static getInstance(): HooksRegistry {
    if (!HooksRegistry.instance) {
      HooksRegistry.instance = new HooksRegistry();
    }
    return HooksRegistry.instance;
  }

  private loadFromFile(): ClientAPIHookData[] | null {
    if (fs.existsSync(this.HOOKS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.HOOKS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading hooks file:', error);
      }
    }
    return null;
  }

  private defaultHooks(): ClientAPIHookData[] {
    return [];
  }

  getHooks(): ClientAPIHookData[] {
    return this.hooks;
  }

  updateHooks(updates: ClientAPIHookData[]) {
    this.hooks = [...this.hooks, ...updates];
    this.saveToFile();
  }

  addHooks(hooks: ClientAPIHookData[]) {
    this.hooks = hooks;
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.HOOKS_PATH, JSON.stringify(this.hooks, null, 2));
  }

  async createHookFolders(rootPath: string, folderNames: string[]) {
    const config = this.getConfig();
    const folderCreator = new FolderCreator();
    if (config.outputs.frontEnd.hooks.active) {
      await folderCreator.createFolders(
        folderNames.map((folderName) => path.join(rootPath, folderName)),
      );
    }
  }

  async createHookTemplates(rootPath: string, hooksTemplates: TemplateToBuild[]) {
    const config = this.getConfig();
    const fileCreator = new FileCreator();
    if (config.outputs.frontEnd.hooks.active) {
      await fileCreator.createFiles(
        hooksTemplates.map((template) => ({
          path: path.join(
            rootPath,
            template.folder ? template.folder : '',
            template.path,
          ),
          content: template.template,
        })),
      );
    }
  }
}
