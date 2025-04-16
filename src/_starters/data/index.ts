import { OrchestratorHelpers } from '../orchestratorHelpers';
import {
  APIFolderData,
  ScaffoldingConfig,
  TableStructureByFile,
} from '../../@types';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';
import {
  ExtractApis,
  ExtractEnums,
  ExtractTables,
  ExtractTypescript,
} from '../../extractors';
import { DataRegistry } from '../../registries/DataRegistry';
import {
  categorizeFolders,
  invertCategorizedFolders,
} from '../../utils/folderUtils';
import { ExtractClientApi } from '../../extractors/ExtractClientApi';

const dataRegistry = DataRegistry.getInstance();

export class DataOrchestrator extends OrchestratorHelpers {
  tableStructureByFile: TableStructureByFile;
  fileTree: ReturnType<typeof TreeStructureManager.prototype.getTreeMap>;

  constructor(config: ScaffoldingConfig, tableStructure: TableStructureByFile) {
    super(config);
    this.tableStructureByFile = tableStructure;
    this.fileTree = this.getFileTree();
    // NOTE need to initialize these here or else the data service will not work because it is initially pulling this from the dataRegistry for OrchestrationHelpers for other services.
    this.tables = Object.keys(tableStructure)
      .map((key) => tableStructure[key])
      .flat();
    this.tableNames = this.tables.map((table) => table.name);
  }
  private extractTypescript() {
    const typescriptData = ExtractTypescript.extract(
      this.tables,
      `${this.fileTree.types.root}/tables`,
      this.fileTree.types.root,
    );
    dataRegistry.addTypescript(typescriptData);
  }

  private extractApis() {
    const folderData: Partial<APIFolderData> = {
      exportsFolder: this.fileTree.api.apis.root,
      root: this.fileTree.api.apis.root,
      fetch: this.fileTree.api.apis.query,
      write: this.fileTree.api.apis.mutation,
    };
    const apiData = ExtractApis.extract(this.tables, folderData);
    dataRegistry.addApis(apiData);
  }

  private extractTables() {
    const tables = ExtractTables.extract(this.tableStructureByFile);
    dataRegistry.addTables(tables);
    const tableNames = dataRegistry.getAllTableNames();
    const tablesToApis = categorizeFolders(tableNames);
    const apisToTables = invertCategorizedFolders(tablesToApis);
    dataRegistry.addTableToApiRelationships(tablesToApis);
    dataRegistry.addApiToTableRelationships(apisToTables);
  }

  private extractClientApiHooks() {
    const hookData = ExtractClientApi.extract(dataRegistry.getAllApis(), {
      library: this.config.frontEnd.clientLibrary,
      framework: this.config.frontEnd.framework,
    });
    // add hookToApi relationship
    const hookNames = Object.keys(hookData);
    hookNames.map((hookName) => {
      dataRegistry.addHookToApiRelationship(hookName, hookData[hookName].apiName);
    });
    // add frontend.apiHooks
    dataRegistry.addHooks(hookData);
  }

  private extractEnums() {
    const enums = ExtractEnums.extract(dataRegistry.getAllTables());

    dataRegistry.addEnums(enums);
  }

  extractData() {
    this.extractTables();
    this.extractTypescript();
    this.extractApis();
    this.extractEnums();
    this.extractClientApiHooks();
  }
}
