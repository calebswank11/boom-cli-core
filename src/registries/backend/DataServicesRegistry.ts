import fs from 'fs';
import { ConfigRegistry } from '../ConfigRegistry';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';
import path from 'path';
import { DataServicesBase, TemplateToBuild } from '../../@types';
import { logSectionHeader, logSectionHeaderError } from '../../utils/logs';

const cleanupTypes = (prevContent: string, newContent: string) => {
  // 🛠 Split content into separate type/interface blocks
  const extractTypeBlocks = (content: string): string[] => {
    return content
      .split(/\n(?=export type\s|export interface\s|import\s)/) // Splits only at `type` or `interface` declarations
      .map((block) => block.trim())
      .filter((block) => block.length > 0);
  };

  const existingBlocks = new Set(extractTypeBlocks(prevContent));
  const newBlocks = extractTypeBlocks(newContent);

  // 🛠 Only add new types/interfaces if they don’t already exist
  newBlocks.forEach((block) => existingBlocks.add(block));

  // 🛠 Convert back into a full file format
  return Array.from(existingBlocks).join('\n\n');
};

export class DataServicesRegistry extends ConfigRegistry {
  private static instance: DataServicesRegistry;
  private dataServices: DataServicesBase[];
  private DATASERVICES_PATH: string;

  private constructor() {
    super();
    this.dataServices = this.loadFromFile() || this.defaultDataServices();
    this.DATASERVICES_PATH =
      this.getRegistryDataPath('DATASERVICES_REGISTRY_PATH') ||
      './dataServices.json';
  }

  static getInstance(): DataServicesRegistry {
    if (!DataServicesRegistry.instance) {
      DataServicesRegistry.instance = new DataServicesRegistry();
    }
    return DataServicesRegistry.instance;
  }

  private loadFromFile(): DataServicesBase[] | null {
    if (fs.existsSync(this.DATASERVICES_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.DATASERVICES_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading dataServices file:', error);
      }
    }
    return null;
  }

  private defaultDataServices(): DataServicesBase[] {
    return [];
  }

  getDataServices(): DataServicesBase[] {
    return this.dataServices;
  }

  createBaseDataServices(dataServices: DataServicesBase[]) {
    this.dataServices = dataServices;
    this.saveToFile();
  }

  addDataService(dataService: DataServicesBase) {
    this.dataServices.push(dataService);
    this.saveToFile();
  }

  updateDataServices(updates: DataServicesBase[]) {
    this.dataServices = [...this.dataServices, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(
      this.DATASERVICES_PATH,
      JSON.stringify(this.dataServices, null, 2),
    );
  }

  async createDataServicesFolders(
    apiRootPath: string,
    dataServicesTypePath: string,
  ) {
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    const categorizedFolders = this.getCategorizedFolders();
    if (!categorizedFolders) {
      throw new Error(
        'Folders not available, please categorize folders prior to building apis',
      );
    } else {
      if (config.outputs.api.helperFunctions.active) {
        await Promise.all(
          Object.keys(categorizedFolders).map(async (folderName) => {
            await folderCreator.createFolder(path.join(apiRootPath, folderName));
            await folderCreator.createFolder(
              path.join(dataServicesTypePath, folderName),
            );
          }),
        );
      } else {
        logSectionHeaderError('apis not included, update config to build them');
      }
    }
  }

  async createDataServices(templates: TemplateToBuild[]) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.api.helperFunctions.active) {
      await fileCreator.createFiles(
        templates.map((template) => ({
          content: template.template,
          path: template.path,
        })),
      );

      logSectionHeader(`✅ Data Services created`);
    } else {
      logSectionHeaderError('⚠️ Data Services not included, update config to build them!');
    }
    // }
  }
}
