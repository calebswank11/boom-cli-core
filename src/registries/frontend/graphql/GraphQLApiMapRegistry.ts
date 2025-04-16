import fs from 'fs';
import { ConfigRegistry } from '../../ConfigRegistry';
import { ApiMapMapBase } from '../../../@types';
import { FileCreator } from '../../../controllers/directoryTools/FileCreator';
import { FolderCreator } from '../../../controllers/directoryTools/FolderCreator';
import path from 'path';

export class GraphQLApiMapRegistry extends ConfigRegistry {
  private static instance: GraphQLApiMapRegistry;
  private graphQLMaps: ApiMapMapBase[];
  private GRAPHQL_API_MAP_REGISTRY_PATH: string;

  private constructor() {
    super();
    this.graphQLMaps = this.loadFromFile() || this.defaultGraphQLApiMaps();
    this.GRAPHQL_API_MAP_REGISTRY_PATH =
      this.getRegistryDataPath('GRAPHQL_API_MAP_REGISTRY_PATH') ||
      './graphQLApiMaps.json';
  }

  static getInstance(): GraphQLApiMapRegistry {
    if (!GraphQLApiMapRegistry.instance) {
      GraphQLApiMapRegistry.instance = new GraphQLApiMapRegistry();
    }
    return GraphQLApiMapRegistry.instance;
  }

  private loadFromFile(): ApiMapMapBase[] | null {
    if (fs.existsSync(this.GRAPHQL_API_MAP_REGISTRY_PATH)) {
      try {
        return JSON.parse(
          fs.readFileSync(this.GRAPHQL_API_MAP_REGISTRY_PATH, 'utf-8'),
        );
      } catch (error) {
        console.error('Error loading objectTypes file:', error);
      }
    }
    return null;
  }

  private defaultGraphQLApiMaps(): ApiMapMapBase[] {
    return [];
  }

  getGraphQLApiMaps(): ApiMapMapBase[] {
    return this.graphQLMaps;
  }

  updateGraphQLApiMaps(updates: ApiMapMapBase[]) {
    this.graphQLMaps = [...this.graphQLMaps, ...updates];
    this.saveToFile();
  }

  createBaseGraphQLApiMap(apiMaps: ApiMapMapBase[]) {
    this.graphQLMaps = apiMaps;
    this.saveToFile();
  }

  addGraphQLApiMap(apiMap: ApiMapMapBase) {
    this.graphQLMaps.push(apiMap);
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(
      this.GRAPHQL_API_MAP_REGISTRY_PATH,
      JSON.stringify(this.graphQLMaps, null, 2),
    );
  }

  async createApiMapFolders(path: string, folders: string[]) {
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    if (config.outputs.frontEnd.apiObjects.active) {
      await folderCreator.createFolders(
        folders.map((folder) => `${path}/${folder}`),
      );
    } else {
      if (config.library === 'apollo-server') {
        console.log(
          '⚠️ Frontend GraphQL objects are not included in the config, skipping creation.',
        );
      }
    }
  }

  async createApiMaps(filePath: string) {
    const fileCreator = new FileCreator();
    const config = this.getConfig();

    if (config.outputs.frontEnd.apiObjects.active) {
      await fileCreator.createFiles(
        this.graphQLMaps.map((apiMap) => ({
          path: path.join(filePath, apiMap.folder, apiMap.fileName),
          content: apiMap.template,
        })),
      );
    } else {
      if (config)
        console.log(
          '⚠️ API Object types not included, update config to build them!',
        );
    }
  }
}
