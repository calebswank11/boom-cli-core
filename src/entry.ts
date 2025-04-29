import dotenv from 'dotenv';
import { ScaffoldingConfig } from './@types';
import {
  BackendOrchestrator,
  CICDOrchestrator,
  CloudOpsOrchestrator,
  DataOrchestrator,
  EnumsOrchestrator,
  FrontendOrchestrator,
} from './_starters';
import { ProcessSqlController } from './controllers/directoryTools/ProcessSqlController';
import { TreeCreator } from './controllers/directoryTools/TreeCreator';
import { TreeStructureManager } from './controllers/directoryTools/TreeStructureManager';
import { ConfigRegistry } from './registries';
import { logBreak, logBSInfo, logFinish, logLogo } from './utils/logs';

dotenv.config();

const originalLog = console.log;

console.log = (...args: any[]) => {
  originalLog(
    ...args.map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg,
    ),
  );
};

const configRegistry = ConfigRegistry.getConfigInstance();

export const boomScaffold = async (config: ScaffoldingConfig) => {
  try {
    logLogo();
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

    logBreak();
    logBreak();
    if (process.env.NODE_ENV !== 'production') {
      console.timeEnd('B!S completion time');
    }
    logBreak();
    logBSInfo();
    logBreak();
    logFinish();

    // Force clear any remaining console output
    console.clear();

  } catch (error) {
    console.error('');
    console.error('Process was interrupted because of an error.');
    console.error(error);
  }
};
