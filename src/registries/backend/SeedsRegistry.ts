import fs from 'fs';
import { SeedBase, SeedsRegistryBase } from '../../@types';
import { ConfigRegistry } from '../ConfigRegistry';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { seedTemplate } from '../../templates/seeds/seed';
import path from 'path';
import { logSectionHeader, logSectionHeaderError } from '../../utils/logs';

export class SeedsRegistry extends ConfigRegistry {
  private static instance: SeedsRegistry;
  private seeds: SeedsRegistryBase[];
  private SEED_PATH: string;

  private constructor() {
    super();
    this.seeds = this.loadFromFile() || this.defaultSeeds();
    this.SEED_PATH =
      this.getRegistryDataPath('SEED_REGISTRY_PATH') || './seeds.json';
  }

  static getInstance(): SeedsRegistry {
    if (!SeedsRegistry.instance) {
      SeedsRegistry.instance = new SeedsRegistry();
    }
    return SeedsRegistry.instance;
  }

  private loadFromFile(): SeedsRegistryBase[] | null {
    if (fs.existsSync(this.SEED_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.SEED_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading seeds file:', error);
      }
    }
    return null;
  }

  private defaultSeeds(): SeedsRegistryBase[] {
    return [];
  }

  getSeeds(): SeedsRegistryBase[] {
    return this.seeds;
  }

  createBaseSeeds(seeds: SeedsRegistryBase[]) {
    this.seeds = seeds;
    this.saveToFile();
  }

  updateSeeds(updates: SeedsRegistryBase[]) {
    this.seeds = [...this.seeds, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.SEED_PATH, JSON.stringify(this.seeds, null, 2));
  }

  async createSeeds(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.api.seeds.dev) {
      await fileCreator.createFiles(
        this.getSeeds().map(({ name, seeds }) => ({
          content: seedTemplate(seeds),
          path: path.join(filePath, name.replace(/.sql/g, '.ts')),
        })),
      );
      logSectionHeader(`✅ Seeds created at ${filePath}`);
    } else {
      logSectionHeaderError('⚠️ Seeds not included, update config to build them');
    }
  }
}
