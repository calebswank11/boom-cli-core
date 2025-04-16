import dotenv from 'dotenv';
import { ScaffoldingConfig } from './@types';
import { ConfigRegistry } from './registries';
import { TreeStructureManager } from './controllers/directoryTools/TreeStructureManager';
import { TreeCreator } from './controllers/directoryTools/TreeCreator';
import { ProcessSqlController } from './controllers/directoryTools/ProcessSqlController';
import {
  BackendOrchestrator,
  CICDOrchestrator,
  CloudOpsOrchestrator,
  DataOrchestrator,
  EnumsOrchestrator,
  FrontendOrchestrator,
} from './_starters';

dotenv.config();

const configRegistry = ConfigRegistry.getConfigInstance();

export const boomScaffold = async (config: ScaffoldingConfig) => {
  const ctx = {};
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.time('B!S completion time');
    }
    // maybe pull config from file registry if development. Will obfuscate development a bit though since that would need to be deleted.
    configRegistry.addConfig(config);
    const treeManager = new TreeStructureManager(config);
    const directoryCreator = new TreeCreator(treeManager);
    await directoryCreator.createDirectoriesAndFiles();
    const directoryToProcess = treeManager.withProjectRoot(config.inputRoot);
    const processSqlController = new ProcessSqlController();
    await processSqlController.getFiles(directoryToProcess);
    await processSqlController.processFiles();

    const tableStructure = processSqlController.getStructure();

    const dataOrchestrator = new DataOrchestrator(config, tableStructure);
    dataOrchestrator.extractData();

    const backendOrchestrator = new BackendOrchestrator(config, tableStructure);
    const frontendOrchestrator = new FrontendOrchestrator(config);
    const cicdOrchestrator = new CICDOrchestrator(config);
    const cloudOpsOrchestrator = new CloudOpsOrchestrator(config);
    const enumsOrchestrator = new EnumsOrchestrator(config);

    await enumsOrchestrator.scaffold();
    await backendOrchestrator.scaffold();
    await frontendOrchestrator.scaffold();
    await cicdOrchestrator.scaffold();
    await cloudOpsOrchestrator.scaffold();

    if (process.env.NODE_ENV !== 'production') {
      console.timeEnd('B!S completion time');
    }

    // NOTE delete existing files for cleanup?
  } catch (error) {
    console.error('');
    console.error('Process was interrupted because of an error.');
    console.error(error);
  }
};
