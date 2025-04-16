import { TreeStructureManager } from '../controllers/directoryTools/TreeStructureManager';
import { TreeCreator } from '../controllers/directoryTools/TreeCreator';
import {ScaffoldingConfig, TableStructureBase, TableStructureByFile} from '../@types';
import {DataRegistry} from '../registries/DataRegistry';

export class OrchestratorHelpers {
  treeManager: TreeStructureManager;
  directoryCreator: TreeCreator;
  config: ScaffoldingConfig;
  tables: TableStructureBase[];
  tableNames: string[];

  constructor(config: ScaffoldingConfig) {
    const dataRegistry = DataRegistry.getInstance();
    this.config = config;
    this.tables = dataRegistry.getAllTables();
    this.tableNames = dataRegistry.getAllTableNames();
    this.treeManager = new TreeStructureManager(config);
    this.directoryCreator = new TreeCreator(this.treeManager);
  }

  getFileTree() {
    return this.treeManager.getTreeMap();
  }
}
