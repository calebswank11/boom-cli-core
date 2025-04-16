import { ClientAPIHookDataRobust, ScaffoldingConfig } from '../../@types';
import { OrchestratorHelpers } from '../orchestratorHelpers';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';
import { DataRegistry } from '../../registries/DataRegistry';
import { ApiMapBuilder } from '../../builders/frontend/apiMaps/ApiMapBuilder';
import { GraphQLApiMapRegistry, HooksRegistry } from '../../registries';
import { HookBuilder } from '../../builders/frontend/hooks/HookBuilder';
import { ComponentBuilder } from '../../builders/frontend/components/ComponentBuilder';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import path from 'path';
import { FolderCreator } from '../../controllers/directoryTools/FolderCreator';
import { logSectionHeader } from '../../utils/logs';

const dataRegistry = DataRegistry.getInstance();

export class FrontendOrchestrator extends OrchestratorHelpers {
  fileTree: ReturnType<typeof TreeStructureManager.prototype.getTreeMap>;

  constructor(config: ScaffoldingConfig) {
    super(config);
    this.fileTree = this.getFileTree();
  }

  private async orchestrateAPIMaps() {
    if (!this.config.outputs.frontEnd.apiObjects.active) {
      console.log('⚠️ Frontend API objects are inactive');
      return;
    }

    const apiMapBuilder = ApiMapBuilder.getBuilder(this.config.library);
    if (!apiMapBuilder) {
      console.error(
        `Frontend Hooks are not supported for this API Library: ${this.config.library}`,
      );
      return;
    }
    const apiMaps = apiMapBuilder.build();

    const graphqlApiMapRegistry = GraphQLApiMapRegistry.getInstance();
    graphqlApiMapRegistry.createBaseGraphQLApiMap(apiMaps);

    const folderNames = [...new Set(apiMaps.map((apiMap) => apiMap.folder))];

    await graphqlApiMapRegistry.createApiMapFolders(
      this.fileTree.frontend.objectMap.root,
      folderNames,
    );

    await graphqlApiMapRegistry.createApiMaps(this.fileTree.frontend.objectMap.root);
  }

  private async orchestrateComponents() {
    if (!this.config.outputs.frontEnd.UI_Library.active) {
      console.log('⚠️ Frontend Components are inactive');
      return;
    }

    const fileCreator = new FileCreator();
    const folderCreator = new FolderCreator();
    const componentBuilder = ComponentBuilder.getBuilder(
      this.config.frontEnd.framework,
      this.config.frontEnd.UI_Library,
    );
    const templates = componentBuilder.build();
    // NOTE this will need to be included in a map in case the response of templates has a unique folder structure
    await folderCreator.createFolder(
      path.join(this.fileTree.frontend.components.root, 'ui'),
    );
    await fileCreator.createFiles(
      templates.map(({ template, path: componentPath, folder }) => ({
        path: path.join(
          this.fileTree.frontend.components.root,
          folder || 'ui',
          componentPath,
        ),
        content: template,
      })),
    );
  }

  private async orchestrateAPIHooks() {
    if (!this.config.outputs.frontEnd.hooks.active) {
      console.log('⚠️ Frontend API Hooks are inactive');
      return;
    }

    const hookBuilder = HookBuilder.getBuilder(
      this.config.frontEnd.framework,
      this.config.frontEnd.clientLibrary,
    );
    if (!hookBuilder) {
      console.error(
        `Frontend Hooks are not supported for this API Library: ${this.config.library}`,
      );
      return;
    }
    const hooksData = dataRegistry.getHooks();
    if (!hooksData) {
      if (this.config.outputs.frontEnd.hooks.active) {
        console.error(
          '⚠️ There was an error building the frontend hooks, please try again',
        );
      } else {
        console.log(
          '⚠️ Hooks are not a part of the config, please adjust config to get frontend hooks',
        );
      }
      return;
    }

    // save hooks data
    const hookRegistry = HooksRegistry.getInstance();
    hookRegistry.addHooks(hooksData);

    const mappedHooks = hooksData.map<ClientAPIHookDataRobust>((hook) => {
      const api = dataRegistry.getApi(hook.apiRootName);

      return {
        ...hook,
        typescript: dataRegistry.getTypescriptByName(hook.typeName),
        arguments: api?.args ? Object.values(api.args) : [],
        parentFolder: api?.folders.parent,
      };
    });

    const folderNames = mappedHooks
      .map((hook) => hook.parentFolder)
      .filter((folderName): folderName is string => folderName != null);

    const hookTemplates = hookBuilder.build(mappedHooks);

    await hookRegistry.createHookFolders(this.fileTree.frontend.hooks.root, [
      ...new Set(folderNames),
    ]);
    await hookRegistry.createHookTemplates(
      this.fileTree.frontend.hooks.root,
      hookTemplates,
    );
  }

  async scaffold() {
    logSectionHeader('🎉 Beginning Frontend Scaffold');
    await this.orchestrateAPIMaps();
    await this.orchestrateAPIHooks();
    await this.orchestrateComponents();
    logSectionHeader('✅ 💾 Frontend Scaffold Complete');
  }
}
