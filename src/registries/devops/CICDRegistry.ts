import fs from 'fs';
import { ConfigRegistry } from '../ConfigRegistry';
type CicdBase = string[];

export class CicdRegistry extends ConfigRegistry {
  private static instance: CicdRegistry;
  private cicd: CicdBase[];
  private CICD_PATH: string;

  private constructor() {
    super();
    this.cicd = this.loadFromFile() || this.defaultCicds();
    this.CICD_PATH = this.getRegistryDataPath('CICD_REGISTRY_PATH') || './cicd.json';
  }

  static getInstance(): CicdRegistry {
    if (!CicdRegistry.instance) {
      CicdRegistry.instance = new CicdRegistry();
    }
    return CicdRegistry.instance;
  }

  private loadFromFile(): CicdBase[] | null {
    if (fs.existsSync(this.CICD_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.CICD_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading cicd file:', error);
      }
    }
    return null;
  }

  private defaultCicds(): CicdBase[] {
    return [];
  }

  getCicd(): CicdBase[] {
    return this.cicd;
  }

  updateCicd(updates: CicdBase[]) {
    this.cicd = [...this.cicd, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.CICD_PATH, JSON.stringify(this.cicd, null, 2));
  }
}
