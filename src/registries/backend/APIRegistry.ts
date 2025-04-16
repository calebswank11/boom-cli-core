import fs from 'fs';
import { EndpointBase, TemplateToBuild } from '../../@types';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { ConfigRegistry } from '../ConfigRegistry';
import path from 'path';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';

export class ApisRegistry extends ConfigRegistry {
  private static instance: ApisRegistry;
  private apis: EndpointBase[];
  private APIS_PATH: string;

  private constructor() {
    super();
    this.apis = this.loadFromFile() || this.defaultApis();
    this.APIS_PATH = this.getRegistryDataPath('APIS_REGISTRY_PATH') || './apis.json';
  }

  static getInstance(): ApisRegistry {
    if (!ApisRegistry.instance) {
      ApisRegistry.instance = new ApisRegistry();
    }
    return ApisRegistry.instance;
  }

  private loadFromFile(): EndpointBase[] | null {
    if (fs.existsSync(this.APIS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(this.APIS_PATH, 'utf-8'));
      } catch (error) {
        console.error('Error loading apis file:', error);
      }
    }
    return null;
  }

  private defaultApis(): EndpointBase[] {
    return [];
  }

  getApis(): EndpointBase[] {
    return this.apis;
  }

  createBaseAPIs(apis: EndpointBase[]) {
    this.apis = apis;
    this.saveToFile();
  }

  updateApis(updates: EndpointBase[]) {
    this.apis = [...this.apis, ...updates];
    this.saveToFile();
  }

  private saveToFile() {
    fs.writeFileSync(this.APIS_PATH, JSON.stringify(this.apis, null, 2));
  }

  async createAPIFolders(apiRootPath: string, folders: string[]) {
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    if (config.outputs.types.active) {
      await folderCreator.createFolders(
        folders.map((folder) => path.join(apiRootPath, folder)),
      );
    }
  }

  async createAPIs(filePath: string, templates: TemplateToBuild[]) {
    const fileCreator = new FileCreator();
    const folderCreator = new FolderCreator();
    const config = this.getConfig();
    // const categorizedFolders = this.getCategorizedFolders();
    if (config.outputs.api.apis.active) {
      await fileCreator.createFiles(
        templates.map((template) => ({
          path: path.join(filePath, template.folder || '', template.path),
          content: template.template,
        })),
      );

      // create subFolders,
      // create apis
      // simpler.

      // const apisByFolder = mapItemToFolder(categorizedFolders, this.getApis());
      //
      // const folders = Object.keys(apisByFolder);
      //
      // const fetchSubFolder = config.apiType === 'graphql' ? 'queries' : '';
      // const writeSubFolder = config.apiType === 'graphql' ? 'mutations' : '';
      //
      // // create Fetch subfolders, largely used for gql
      // // if raw express/nest, the first will create and the second will just process without creating
      // await folderCreator.createFolders(
      //   folders.map((folder) => path.join(filePath, fetchSubFolder, folder)),
      // );
      // await folderCreator.createFolders(
      //   folders.map((folder) => path.join(filePath, writeSubFolder, folder)),
      // );
      //
      // const endpointBuilder = new EndpointBuilder();
      // for (const folder of folders) {
      //   // api for specific folder.
      //   const endpoints = endpointBuilder.buildEndpointsTemplate(
      //     folder,
      //     apisByFolder[folder],
      //   );
      //
      //   if (!endpoints) {
      //     // no endpoints, uiLibrary not supported
      //     return;
      //   }
      //
      //   for (const endpoint of endpoints) {
      //     await fileCreator.createFile(
      //       path.join(config.root, config.outputs.api.apis.folder, endpoint.path),
      //       endpoint.template,
      //     );
      //   }
      // }

      console.log('-------------------------------');
      console.log(`✅ APIs created at ${filePath}`);
    } else {
      console.log('⚠️ APIS not included, update config to build them');
    }
  }

  async createBaseResolvers(filePath: string) {}
}
