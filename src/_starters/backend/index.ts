import {
  BuildDataServicesPayload,
  ORMEnum,
  ScaffoldingConfig,
  TableStructureByFile,
} from '../../@types';
import {
  buildMigrationsData,
  buildSeedsData,
  buildTypedefs,
  buildTypescriptData,
} from '../../builders';
import { DataServiceBuilder } from '../../builders/dataServices/DataServiceBuilder';
import { EndpointBuilder } from '../../builders/endpoints/EndpointBuilder';
import { ModelBuilder } from '../../builders/models/modelBuilder';
import { buildAndCreateServer } from '../../controllers/directoryTools/baseProjectFiles/creasteServer';
import { FileCreator } from '../../controllers/directoryTools/FileCreator';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';
import { ApiRouteFactory } from '../../factories/endpoints/node/ApiRouteFactory';
import {
  ApisRegistry,
  DataServicesRegistry,
  MigrationsRegistry,
  RouteRegistry,
  SeedsRegistry,
  TypedefsRegistry,
  TypescriptRegistry,
} from '../../registries';
import { DataRegistry } from '../../registries/DataRegistry';
import { PackageRegistryRegistry } from '../../registries/PackageRegistry';
import { logRepoIssuesLink, logSectionHeader } from '../../utils/logs';
import { camelToPascal } from '../../utils/stringUtils';
import { OrchestratorHelpers } from '../orchestratorHelpers';

const dataRegistry = DataRegistry.getInstance();

export class BackendOrchestrator extends OrchestratorHelpers {
  fileTree: ReturnType<typeof TreeStructureManager.prototype.getTreeMap>;
  tableStructure: TableStructureByFile;

  constructor(config: ScaffoldingConfig, tableStructure: TableStructureByFile) {
    super(config);
    this.fileTree = this.getFileTree();
    this.tableStructure = tableStructure;
  }
  private async orchestrateSeeds() {
    const seedRegistry = SeedsRegistry.getInstance();
    const seedData = buildSeedsData(this.tableStructure);
    seedRegistry.createBaseSeeds(seedData);
    await seedRegistry.createSeeds(this.getFileTree().api.seeds.dev);
  }

  private async orchestrateMigrations() {
    const migrationsRegistry = MigrationsRegistry.getInstance();
    const migrations = buildMigrationsData(this.tableStructure, this.config.orm);
    migrationsRegistry.createBaseMigrations(migrations);
    await migrationsRegistry.createMigrations(
      this.getFileTree().api.migrations.root,
    );
  }

  private async orchestrateTypescript() {
    const typescriptRegistry = TypescriptRegistry.getInstance();
    const typescriptParentFolder = `${this.fileTree.types.root}/tables`;
    const { typescriptBase, ormTypes } = buildTypescriptData(
      dataRegistry.getTypescript(),
    );
    typescriptRegistry.createBaseTypescript(typescriptBase);
    await typescriptRegistry.createTypescript(`${typescriptParentFolder}/index.ts`);
    if (this.config.orm === ORMEnum.knex) {
      await typescriptRegistry.createORMTypes(
        `${this.fileTree.types.root}/tables/_knex.d.ts`,
        ormTypes,
      );
    }
  }

  private async orchestrateModels() {
    // only if sequelize for now
    if (this.config.orm !== ORMEnum.sequelize) {
      console.error('⚠️ Models only supported for sequelize right now.');
      logRepoIssuesLink();
      return;
    }
    const fileCreator = new FileCreator();
    const builder = ModelBuilder.getBuilder(this.config.orm);

    if (!builder) {
      console.error(
        '⚠️ ORM Models not currently supported. Open an issue on github to request',
      );
      logRepoIssuesLink();
      return;
    }

    const modelFiles = builder.build(dataRegistry.getAllTables());

    // Create all model files first
    await fileCreator.createFiles(
      modelFiles.map(({ template, path }) => ({
        path: `${this.fileTree.api.models!.root!}/${path}.ts`,
        content: template,
      })),
    );

    // Create an index file that initializes all models
    const indexContent = `
      import { Sequelize } from 'sequelize';
      import { getSequelize } from '../database/connectToDB';
      ${modelFiles.map(({ path }) => `import { ${camelToPascal(path.split('/').pop()!.replace('.ts', ''))}Model } from './${path}';`).join('\n')}

      const sequelize = getSequelize();

      // Initialize all models
      export const initializeModels = async () => {
        try {
          // Test the database connection
          await sequelize.authenticate();
          console.log('Database connection established successfully.');

          // Sync all models
          await sequelize.sync();
          console.log('All models synchronized successfully.');

          return true;
        } catch (error) {
          console.error('Error initializing models:', error);
          return false;
        }
      };

      // Export all models
      export {
        ${modelFiles.map(({ path }) => `${camelToPascal(path.split('/').pop()!.replace('.ts', ''))}Model`).join(',\n')}
      };
    `;

    await fileCreator.createFile(
      `${this.fileTree.api.models!.root!}/index.ts`,
      indexContent,
    );
  }

  private async orchestrateAPIS() {
    const apiRegistry = ApisRegistry.getInstance();
    // create nested apiType folders by category

    const apiFolders = [
      ...new Set(Object.values(dataRegistry.getAllApiToTableRelationships())),
    ];

    if (this.config.apiType === 'graphql') {
      await apiRegistry.createAPIFolders(
        this.fileTree.api.apis.mutation!,
        apiFolders,
      );
      await apiRegistry.createAPIFolders(this.fileTree.api.apis.query!, apiFolders);
    } else {
      // create api's // controllers
      await apiRegistry.createAPIFolders(this.fileTree.api.apis.root!, apiFolders);
      // create routes
      await apiRegistry.createAPIFolders(
        this.fileTree.api.routes!.root!,
        apiFolders,
      );
    }

    const endpointBuilder = new EndpointBuilder();

    const endpointData = endpointBuilder.aggregateEndpointData(
      dataRegistry.getAllApis(),
    );

    const endpointTemplates = endpointBuilder.buildEndpointsTemplate(endpointData);

    if (!endpointTemplates) {
      console.error('APIs not created, please try again.');
      return;
    }

    await apiRegistry.createAPIs(this.fileTree.api.apis.root!, endpointTemplates);
  }

  private async orchestrateRoutes() {
    const routeRegistry = RouteRegistry.getInstance();
    const routeFactory = ApiRouteFactory.getRouteFactory(this.config.library);
    if (!routeFactory) {
      return;
    }
    const routesData = routeFactory.buildRoutes(dataRegistry);
    routeRegistry.saveRoutes(routesData);
    const routes = routeFactory.getRoutesByFolder(routesData);
    if (this.config.apiType === 'graphql') {
      await routeRegistry.createBaseRoutes(
        this.getFileTree().api.apis.root!,
        routes,
      );
    } else {
      if (!this.getFileTree().api.routes) {
        console.error('⚠️ Cannot create routes, config for routes is missing.');
        return;
      }
      await routeRegistry.createBaseRoutes(
        this.getFileTree().api.routes!.root!,
        routes,
      );
    }
  }

  private async orchestrateTypedefs() {
    if (this.config.apiType !== 'graphql') {
      return;
    }
    const typedefRegistry = TypedefsRegistry.getInstance();
    const typedefs = buildTypedefs(this.tables);
    // create nested apiType folders by category
    if (!typedefRegistry.getCategorizedFolders()) {
      typedefRegistry.setCategorizedFolders(this.tableNames);
    }
    typedefRegistry.createBaseTypedefs(typedefs);
    await typedefRegistry.createTypedefsFolders(this.fileTree.api.typedefs!.root);
    await typedefRegistry.createTypedefs(this.fileTree.api.typedefs!.root);
  }

  private async orchestrateDataServices() {
    const builder = DataServiceBuilder.getBuilder(this.config.orm);
    if (!builder) return;

    const apiFoldersDict = [
      ...new Set(Object.values(dataRegistry.getAllApiToTableRelationships())),
    ].reduce<Record<string, Record<string, BuildDataServicesPayload>>>(
      (acc, cur) => ({
        ...acc,
        [cur]: {},
      }),
      {},
    );

    const templates = builder.build(
      dataRegistry.getAllApis(),
      apiFoldersDict,
      this.fileTree.api.helperFunctions.root,
      `${this.fileTree.types.root}/dataServices`,
    );

    const dataServicesRegistry = DataServicesRegistry.getInstance();
    if (!dataServicesRegistry.getCategorizedFolders()) {
      dataServicesRegistry.setCategorizedFolders(this.tableNames);
    }

    await dataServicesRegistry.createDataServicesFolders(
      this.fileTree.api.helperFunctions.root,
      `${this.fileTree.types.root}/dataServices`,
    );
    await dataServicesRegistry.createDataServices(templates);
  }

  private async orchestrateFoundation() {
    const packageRegistry = PackageRegistryRegistry.getInstance();
    packageRegistry.buildDefaultPackageRegistry();
    await packageRegistry.buildAndCreatePackage();
    await buildAndCreateServer();
  }

  async scaffold() {
    logSectionHeader('🎉 Beginning API Scaffold');
    await this.orchestrateSeeds();
    await this.orchestrateMigrations();
    await this.orchestrateAPIS();
    // NOTE ^^ this needs to come before routes and typedefs to ensure injection works
    await this.orchestrateModels();
    await this.orchestrateRoutes();
    await this.orchestrateTypedefs();
    await this.orchestrateDataServices();
    await this.orchestrateTypescript();
    // NOTE: ^^ Put later because random types will be added for args, dataservices, etc.
    await this.orchestrateFoundation();
    logSectionHeader('✅ 💾 API Scaffold Complete');
  }
}
