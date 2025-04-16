import fs from 'fs';
import { ConfigRegistry } from '../ConfigRegistry';
type InfraBase = string[];

export class InfraRegistry extends ConfigRegistry {
  private static instance: InfraRegistry;
  private infra: InfraBase[];
  private INFRA_PATH: string;

  private constructor() {
    super();
    this.infra = this.loadFromFile() || this.defaultInfras();
    this.INFRA_PATH =
      this.getRegistryDataPath('INFRA_REGISTRY_PATH') || './typedefs.json';
  }

  static getInstance(): InfraRegistry {
    if (!InfraRegistry.instance) {
      InfraRegistry.instance = new InfraRegistry();
    }
    return InfraRegistry.instance;
  }

  private loadFromFile(): InfraBase[] | null {
    if (fs.existsSync(this.INFRA_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.INFRA_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading infra file:', error);
      }
    }
    return null;
  }

  private defaultInfras(): InfraBase[] {
    return [];
  }

  getInfra(): InfraBase[] {
    return this.infra;
  }

  updateInfra(updates: InfraBase[]) {
    this.infra = [...this.infra, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.INFRA_PATH, JSON.stringify(this.infra, null, 2));
  }
}
