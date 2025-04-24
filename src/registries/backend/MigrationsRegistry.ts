import fs from 'fs';
import { MigrationsRegistryBase } from '../../@types';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { ConfigRegistry } from '../ConfigRegistry';
import { getMigrationsTemplate } from '../../templates/migrations/migration';
import path from 'path';
import { logSectionHeader, logSectionHeaderError } from '../../utils/logs';

export class MigrationsRegistry extends ConfigRegistry {
  private static instance: MigrationsRegistry;
  private migrations: MigrationsRegistryBase[];
  private MIGRATIONS_PATH: string;

  private constructor() {
    super();
    this.migrations = this.loadFromFile() || this.defaultMigrations();
    this.MIGRATIONS_PATH =
      this.getRegistryDataPath('MIGRATIONS_REGISTRY_PATH') || './migrations.json';
  }

  static getInstance(): MigrationsRegistry {
    if (!MigrationsRegistry.instance) {
      MigrationsRegistry.instance = new MigrationsRegistry();
    }
    return MigrationsRegistry.instance;
  }

  private loadFromFile(): MigrationsRegistryBase[] | null {
    if (fs.existsSync(this.MIGRATIONS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.MIGRATIONS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading migrations file:', error);
      }
    }
    return null;
  }

  private defaultMigrations(): MigrationsRegistryBase[] {
    return [];
  }

  getMigrations(): MigrationsRegistryBase[] {
    return this.migrations;
  }

  createBaseMigrations(migrations: MigrationsRegistryBase[]) {
    this.migrations = migrations;
    this.saveToFile();
  }

  updateMigrations(updates: MigrationsRegistryBase[]) {
    this.migrations = [...this.migrations, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.MIGRATIONS_PATH, JSON.stringify(this.migrations, null, 2));
  }

  async createMigrations(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.api.migrations.active) {
      const migrationsTemplate = getMigrationsTemplate(config.orm);
      if(!migrationsTemplate) {
        throw new Error(`⚠️ Migrations Template does not exist, please check your configuration`)
      }
      await fileCreator.createFiles(
        this.getMigrations().map(({ name, migrations }) => ({
          content: migrationsTemplate({
            ...migrations,
            enumPath: '../enums',
            name
          }),
          path: path.join(filePath, name.replace(/.sql/g, '.ts')),
        })),
      );
      logSectionHeader(`✅ Migrations created at ${filePath}`);
    } else {
      logSectionHeaderError('⚠️ Migrations not included, update config to build them');
    }
  }
}
