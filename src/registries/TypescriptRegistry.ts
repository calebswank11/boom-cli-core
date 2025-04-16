import fs from 'fs';
import { TypescriptBase } from '../@types';
import { FileCreator } from '../controllers/directoryTools/FileCreator';
import { ConfigRegistry } from './ConfigRegistry';
import { typesTemplate } from '../templates/@types/tables';
import { knexORMTemplate } from '../templates/@types/tables/ormConfig/knex';

export class TypescriptRegistry extends ConfigRegistry {
  private static instance: TypescriptRegistry;
  private typescript: TypescriptBase[];
  private TYPESCRIPT_PATH: string;

  private constructor() {
    super();
    this.typescript = this.loadFromFile() || this.defaultTypescripts();
    this.TYPESCRIPT_PATH =
      this.getRegistryDataPath('TYPESCRIPT_REGISTRY_PATH') || './typescript.json';
  }

  static getInstance(): TypescriptRegistry {
    if (!TypescriptRegistry.instance) {
      TypescriptRegistry.instance = new TypescriptRegistry();
    }
    return TypescriptRegistry.instance;
  }

  private loadFromFile(): TypescriptBase[] | null {
    if (fs.existsSync(this.TYPESCRIPT_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.TYPESCRIPT_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading typescript file:', error);
      }
    }
    return null;
  }

  private defaultTypescripts(): TypescriptBase[] {
    return [];
  }

  getTypescript(): TypescriptBase[] {
    return this.typescript;
  }

  createBaseTypescript(typescript: TypescriptBase[]) {
    this.typescript = typescript;
    this.saveToFile();
  }

  updateTypescript(updates: TypescriptBase[]) {
    this.typescript = [...this.typescript, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.TYPESCRIPT_PATH, JSON.stringify(this.typescript, null, 2));
  }

  async createTypescript(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.types.active) {
      await fileCreator.createFiles(
        this.getTypescript().map(({ contents, enums }) => ({
          content: typesTemplate(contents, enums, '../../../enums'),
          path: filePath,
        })),
      );
    }
  }
  async createORMTypes(filePath: string, ormTypes: [string, string][]) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.types.active) {
      await fileCreator.createFiles([
        {
          content: knexORMTemplate(ormTypes),
          path: filePath,
        },
      ]);
      console.log('-------------------------------');
      console.log(`✅ Typescript types created at ${filePath}`);
    } else {
      console.log('⚠️ Typescript types not included, update config to build them!');
    }
  }
}
