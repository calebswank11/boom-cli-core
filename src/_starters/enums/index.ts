import { ScaffoldingConfig, TableStructureBase } from '../../@types';
import { OrchestratorHelpers } from '../orchestratorHelpers';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';
import { EnumsRegistry } from '../../registries';
import { buildEnums } from '../../helpers';

export class EnumsOrchestrator extends OrchestratorHelpers {
  fileTree: ReturnType<typeof TreeStructureManager.prototype.getTreeMap>;

  constructor(config: ScaffoldingConfig) {
    super(config);
    this.fileTree = this.getFileTree();
  }

  private async orchestrateEnums() {
    const enumRegistry = EnumsRegistry.getInstance();
    const enums = buildEnums(this.tables);
    enumRegistry.createBaseEnums(enums);
    await enumRegistry.createEnums(this.fileTree.enums);
  }
  async scaffold() {
    await this.orchestrateEnums();
  }
}
