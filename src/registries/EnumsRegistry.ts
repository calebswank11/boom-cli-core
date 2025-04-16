import fs from 'fs';
import { ConfigRegistry } from './ConfigRegistry';
import { FileCreator } from '../controllers/directoryTools/FileCreator';
import path from 'path';

export type EnumsBase = string;

export class EnumsRegistry extends ConfigRegistry {
  private static instance: EnumsRegistry;
  private enums: EnumsBase[];
  private ENUMS_PATH: string;

  private constructor() {
    super();
    this.enums = this.loadFromFile() || this.defaultEnums();
    this.ENUMS_PATH =
      this.getRegistryDataPath('ENUMS_REGISTRY_PATH') || './enums.json';
  }

  static getInstance(): EnumsRegistry {
    if (!EnumsRegistry.instance) {
      EnumsRegistry.instance = new EnumsRegistry();
    }
    return EnumsRegistry.instance;
  }

  private loadFromFile(): EnumsBase[] | null {
    if (fs.existsSync(this.ENUMS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.ENUMS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading enums file:', error);
      }
    }
    return null;
  }

  private defaultEnums(): EnumsBase[] {
    return [];
  }

  getEnums(): EnumsBase[] {
    return this.enums;
  }

  createBaseEnums(enums: EnumsBase[]) {
    this.enums = enums;
    this.saveToFile();
  }

  addEnum(enumerator: EnumsBase) {
    this.updateEnums([enumerator]);
  }

  updateEnums(updates: EnumsBase[]) {
    this.enums = [...this.enums, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.ENUMS_PATH, JSON.stringify(this.enums, null, 2));
  }

  async createEnums(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.enums.active) {
      await fileCreator.createFile(
        path.join(filePath, 'index.ts'),
        this.enums.join('\n'),
      );
      console.log('-------------------------------');
      console.log(`✅ Enums created at ${filePath}`);
    } else {
      console.log('⚠️ Enums not included, update config to build them!');
    }
  }
}
