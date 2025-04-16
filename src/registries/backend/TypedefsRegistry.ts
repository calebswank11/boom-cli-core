import fs from 'fs';
import { TypedefsBase } from '../../@types';
import { ConfigRegistry } from '../ConfigRegistry';
import { mapItemToFolder } from '../../utils/folderUtils';
import path from 'path';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';
import { graphqlTemplate } from '../../templates/models/graphql';
import { logSectionHeader, logSectionHeaderError } from '../../utils/logs';

export class TypedefsRegistry extends ConfigRegistry {
  private static instance: TypedefsRegistry;
  private typedefs: TypedefsBase[];
  private TYPEDEFS_PATH: string;

  private constructor() {
    super();
    this.typedefs = this.loadFromFile() || this.defaultTypedefs();
    this.TYPEDEFS_PATH =
      this.getRegistryDataPath('TYPEDEFS_REGISTRY_PATH') || './typedefs.json';
  }

  static getInstance(): TypedefsRegistry {
    if (!TypedefsRegistry.instance) {
      TypedefsRegistry.instance = new TypedefsRegistry();
    }
    return TypedefsRegistry.instance;
  }

  private loadFromFile(): TypedefsBase[] | null {
    if (fs.existsSync(this.TYPEDEFS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.TYPEDEFS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading typedefs file:', error);
      }
    }
    return null;
  }

  private defaultTypedefs(): TypedefsBase[] {
    return [];
  }

  getTypedefs(): TypedefsBase[] {
    return this.typedefs;
  }

  createBaseTypedefs(typedefs: TypedefsBase[]) {
    this.typedefs = typedefs;
    this.saveToFile();
  }

  updateTypedefs(updates: TypedefsBase[]) {
    this.typedefs = [...this.typedefs, ...updates];
    this.saveToFile();
  }

  addTypedef(typedef: TypedefsBase) {
    this.typedefs.push(typedef);
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.TYPEDEFS_PATH, JSON.stringify(this.typedefs, null, 2));
  }

  async createTypedefsFolders(apiRootPath: string) {
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    const categorizedFolders = this.getCategorizedFolders();
    if (!categorizedFolders) {
      throw new Error(
        'Folders not available, please categorize folders prior to building apis',
      );
    } else {
      if (config.outputs.api.typedefs.active) {
        await Promise.all(
          Object.keys(categorizedFolders).map((folderName) => {
            folderCreator.createFolder(path.join(apiRootPath, folderName));
          }),
        );
      } else {
        console.log('typescript not included, update config to build them');
      }
    }
  }

  async createTypedefs(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    const categorizedFolders = this.getCategorizedFolders();
    if (!categorizedFolders) {
      throw new Error(
        'Folders not available, please create folders prior to building typedefs',
      );
    } else {
      if (config.outputs.api.typedefs.active) {
        const typeDefsByFolder = mapItemToFolder<TypedefsBase>(
          categorizedFolders,
          this.typedefs,
        );

        const folderNames = Object.keys(typeDefsByFolder);

        await Promise.all(
          folderNames.map(async (folder) => {
            await fileCreator.createFile(
              path.join(filePath, folder, 'index.ts'),
              graphqlTemplate(typeDefsByFolder[folder]),
            );
          }),
        );
        await fileCreator.createFile(
          path.join(filePath, 'index.ts'),
          folderNames.map((folder) => `export * from './${folder}';`).join('\n'),
        );
        logSectionHeader(`✅ Typedefs created at ${filePath}`);
      } else {
        logSectionHeaderError('⚠️ Typedefs not included, update config to build them!');
      }
    }
  }
}
