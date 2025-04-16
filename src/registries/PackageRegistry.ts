import fs from 'fs';
import { PackageRegistryBase } from '../@types';
import { ConfigRegistry } from './ConfigRegistry';
import { packageJsonConfig } from '../data/packageConfig';
import { packageRegistryTemplate } from '../templates/packageJson';
import { FileCreator } from '../controllers/directoryTools/FileCreator';

export class PackageRegistryRegistry extends ConfigRegistry {
  private static instance: PackageRegistryRegistry;
  private packageRegistry: PackageRegistryBase;
  private PACKAGE_PATH: string = './packageRegistry.json';

  private constructor() {
    super();
    this.packageRegistry = this.loadFromFile() || this.defaultPackageRegistries();
  }

  static getInstance(): PackageRegistryRegistry {
    if (!PackageRegistryRegistry.instance) {
      PackageRegistryRegistry.instance = new PackageRegistryRegistry();
    }
    return PackageRegistryRegistry.instance;
  }

  buildDefaultPackageRegistry() {
    const config = this.getConfig();
  }

  private loadFromFile(): PackageRegistryBase | null {
    if (fs.existsSync(this.PACKAGE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.PACKAGE_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading packageRegistry file:', error);
      }
    }
    return null;
  }

  private defaultPackageRegistries(): PackageRegistryBase {
    return packageJsonConfig;
  }

  getPackageRegistry(): PackageRegistryBase {
    return this.packageRegistry;
  }

  updatePackageRegistry(updates: PackageRegistryBase) {
    this.packageRegistry = {
      ...this.packageRegistry,
      ...updates,
    };
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(
      this.PACKAGE_PATH,
      JSON.stringify(this.packageRegistry, null, 2),
    );
  }

  async buildAndCreatePackage() {
    const config = this.getConfig();
    const fileCreator = new FileCreator();
    const template = packageRegistryTemplate(this.packageRegistry);
    await fileCreator.createFile(`${config.root}/package.json`, template, 'json');
    console.log(`✅ package.json created at root`);
  }
}
