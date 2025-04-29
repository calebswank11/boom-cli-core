import { ConfigRegistry } from '../ConfigRegistry';
import { RouteBase, TemplateToBuild } from '../../@types';
import fs from 'fs';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import path from 'path';

export class RouteRegistry extends ConfigRegistry {
  private static instance: RouteRegistry;
  private routes: RouteBase[];
  private ROUTES_PATH: string;

  private constructor() {
    super();
    this.routes = this.loadFromFile() || this.defaultRoutes();
    this.ROUTES_PATH =
      this.getRegistryDataPath('ROUTES_REGISTRY_PATH') || './routes.json';
  }

  static getInstance(): RouteRegistry {
    if (!RouteRegistry.instance) {
      RouteRegistry.instance = new RouteRegistry();
    }
    return RouteRegistry.instance;
  }

  private loadFromFile(): RouteBase[] | null {
    if (fs.existsSync(this.ROUTES_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.ROUTES_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading routes file:', error);
      }
    }
    return null;
  }

  private defaultRoutes(): RouteBase[] {
    return [];
  }

  getRoutes(): RouteBase[] {
    return this.routes;
  }

  saveRoutes(routes: RouteBase[]) {
    this.routes = routes;
    this.saveToFile();
  }

  updateRoutes(updates: RouteBase[]) {
    this.routes = [...this.routes, ...updates];
    this.saveToFile();
  }

  addRoute(route: RouteBase) {
    this.routes.push(route);
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.ROUTES_PATH, JSON.stringify(this.routes, null, 2));
  }

  async createBaseRoutes(
    rootFilePath: string,
    baseRoutes: TemplateToBuild[],
  ) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();
    if (config.outputs.api.apis.active) {
      for (const route of baseRoutes) {
        await fileCreator.createFile(
          path.join(rootFilePath, route.path),
          route.template,
        );
      }
    }
  }
}
