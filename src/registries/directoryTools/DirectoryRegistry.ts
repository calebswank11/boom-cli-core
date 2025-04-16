import fs from 'fs';
import { ConfigRegistry } from '../ConfigRegistry';

type DirectoryRegistryBase = string[];

class DirectoryRegistry extends ConfigRegistry {
  private static instance: DirectoryRegistry;
  private directoryRegistry: DirectoryRegistryBase[];
  private DIRECTORY_PATH: string;

  private constructor() {
    super();
    this.directoryRegistry =
      this.loadFromFile() || this.defaultDirectoryRegistries();
    this.DIRECTORY_PATH =
      this.getRegistryDataPath('DIRECTORY_REGISTRY_PATH') || './directory.json';
  }

  static getInstance(): DirectoryRegistry {
    if (!DirectoryRegistry.instance) {
      DirectoryRegistry.instance = new DirectoryRegistry();
    }
    return DirectoryRegistry.instance;
  }

  private loadFromFile(): DirectoryRegistryBase[] | null {
    if (fs.existsSync(this.DIRECTORY_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.DIRECTORY_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading directoryRegistry file:', error);
      }
    }
    return null;
  }

  private defaultDirectoryRegistries(): DirectoryRegistryBase[] {
    return [];
  }

  getDirectoryRegistry(): DirectoryRegistryBase[] {
    return this.directoryRegistry;
  }

  updateDirectoryRegistry(updates: DirectoryRegistryBase[]) {
    this.directoryRegistry = [...this.directoryRegistry, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(
      this.DIRECTORY_PATH,
      JSON.stringify(this.directoryRegistry, null, 2),
    );
  }
}
