import fs from 'fs';
import { EndpointBase, TemplateToBuild } from '../../@types';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { ConfigRegistry } from '../ConfigRegistry';
import path from 'path';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';
import { logSectionHeader, logSectionHeaderError } from '../../utils/logs';

export class ApisRegistry extends ConfigRegistry {
  private static instance: ApisRegistry;
  private apis: EndpointBase[];
  private APIS_PATH: string;

  private constructor() {
    super();
    this.apis = this.loadFromFile() || this.defaultApis();
    this.APIS_PATH = this.getRegistryDataPath('APIS_REGISTRY_PATH') || './apis.json';
  }

  static getInstance(): ApisRegistry {
    if (!ApisRegistry.instance) {
      ApisRegistry.instance = new ApisRegistry();
    }
    return ApisRegistry.instance;
  }

  private loadFromFile(): EndpointBase[] | null {
    if (fs.existsSync(this.APIS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.APIS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading apis file:', error);
      }
    }
    return null;
  }

  private defaultApis(): EndpointBase[] {
    return [];
  }

  getApis(): EndpointBase[] {
    return this.apis;
  }

  createBaseAPIs(apis: EndpointBase[]) {
    this.apis = apis;
    this.saveToFile();
  }

  updateApis(updates: EndpointBase[]) {
    this.apis = [...this.apis, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.APIS_PATH, JSON.stringify(this.apis, null, 2));
  }

  async createAPIFolders(apiRootPath: string, folders: string[]) {
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    if (config.outputs.types.active) {
      await folderCreator.createFolders(
        folders.map((folder) => path.join(apiRootPath, folder)),
      );
    }
  }

  async createAPIs(filePath: string, templates: TemplateToBuild[]) {
    const fileCreator = new FileCreator();
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    // const categorizedFolders = this.getCategorizedFolders();
    if (config.outputs.api.apis.active) {
      await fileCreator.createFiles(
        templates.map((template) => ({
          path: path.join(filePath, template.folder || '', template.path),
          content: template.template,
        })),
      );

      logSectionHeader(`✅ APIs created at ${filePath}`);
    } else {
      logSectionHeaderError('⚠️ APIS not included, update config to build them');
    }
  }

  async createBaseResolvers(filePath: string) {}
}
