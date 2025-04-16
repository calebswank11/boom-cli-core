import { ScaffoldingConfig, TableStructureBase } from '../../@types';
import { OrchestratorHelpers } from '../orchestratorHelpers';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';

export class CloudOpsOrchestrator extends OrchestratorHelpers {
  fileTree: ReturnType<typeof TreeStructureManager.prototype.getTreeMap>;

  constructor(config: ScaffoldingConfig) {
    super(config);
    this.fileTree = this.getFileTree();
  }
  async scaffold() {}
}
