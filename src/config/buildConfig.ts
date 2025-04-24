import fs from 'fs';
import {
  ApiTypesEnum,
  AuthMethodsEnum,
  CI_CDOptionsEnum,
  ClientLibrariesEnum,
  CLIOptions,
  CloudProvidersEnum,
  DeploymentTargetsEnum,
  FrameworksEnum,
  IaCToolTypesEnum,
  LibrariesEnum,
  LicensesEnum,
  ORMEnum,
  RateLimitingTypesEnum,
  ScaffoldingConfig,
  StateManagementTypesEnum,
  UILibrariesEnum,
} from '../@types';

export const validateConfig = (configFile: Partial<ScaffoldingConfig>) => {
  return configFile as ScaffoldingConfig;
};

export const buildConfig = async (
  finalOptions: CLIOptions,
): Promise<ScaffoldingConfig> => {
  const {
    config: configPath,
    orm,
    apiType,
    library,
    frontEnd,
    infra,
  } = finalOptions;

  if (configPath) {
    try {
      const configFile = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      // validate config file.
      return validateConfig(configFile);
    } catch (error) {
      console.log('configuration file does not exist, creating one.');
    }
  }

  const config: ScaffoldingConfig = {
    project: {
      name: 'my-project',
      type: 'ts',
      license: LicensesEnum.MIT,
    },
    inputRoot: 'sqlInput',
    srcRoot: 'src',
    root: 'build',
    rootFrontend: 'app',
    orm: ORMEnum.knex,
    library: LibrariesEnum.apollo_server,
    apiType: ApiTypesEnum.graphql,
    outputs: {
      types: { folder: 'src/@types', active: true },
      enums: { folder: 'enums', active: true },
      config: { folder: 'src/config', active: true },
      api: {
        migrations: {
          folder: 'migrations',
          active: true,
        },
        seeds: {
          folder: 'seeds',
          dev: true,
          staging: false,
          prod: false,
        },
        apis: { folder: `src/resolvers`, active: false },
        typedefs: { folder: 'src/typedefs', active: false },
        routes: { folder: 'src/routes', active: false },
        models: { folder: 'src/models', active: false },
        helperFunctions: { folder: 'src/dataServices', active: true },
        tests: true,
      },
      admin: {
        scaffold: true,
      },
      frontEnd: {
        framework: { folder: 'app', active: true },
        hooks: { folder: 'app/hooks', active: true },
        apiObjects: { folder: 'app/api', active: true },
        stateManagement: { folder: 'app/store', active: true },
        UI_Library: { folder: 'app/config', active: true },
      },
    },
    frontEnd: {
      framework: FrameworksEnum.react,
      clientLibrary: ClientLibrariesEnum.apollo_client,
      hooks: true,
      apiObjects: true,
      stateManagement: StateManagementTypesEnum.redux,
      UI_Library: UILibrariesEnum.tailwind,
    },
    database: {
      dialect: ORMEnum.knex,
      connection: 'postgres://user:pass@localhost:5432/mydb',
      pooling: {
        min: 2,
        max: 10,
      },
      logging: false,
    },
    apiLayer: {
      versioning: true,
      authentication: AuthMethodsEnum.jwt,
      rateLimiting: RateLimitingTypesEnum.basic,
      caching: true,
      errorHandling: true,
    },
    codeStyle: {
      indentation: 'spaces',
      lineLength: 80,
      linting: true,
      strictTypes: true,
    },
    deployment: {
      docker: true,
      CI_CD: CI_CDOptionsEnum.github_actions,
      hosting: DeploymentTargetsEnum.vercel,
    },
    infrastructure: {
      provider: CloudProvidersEnum.aws,
      iac: IaCToolTypesEnum.cdk,
      services: {
        database: true, // RDS, DynamoDB
        storage: true, // S3, Blob Storage, GCS
        functions: true, // Lambda, Cloud Functions
        containerization: true, // ECS, EKS, AKS, GKE
        networking: false, // Optional VPC setup
      },
    },
  };

  if (orm) {
    config.orm = orm;
    config.database.dialect = orm;
    if (orm === ORMEnum.sequelize) {
      config.outputs.api.seeds.folder = 'seeders';
    }
  }

  if (apiType) {
    config.apiType = apiType;
    if (apiType === 'graphql') {
      config.outputs.api.apis = {
        folder: `${config.srcRoot}/resolvers`,
        active: true,
      };
      config.outputs.api.typedefs.active = true;
    } else {
      // rest config
      config.outputs.api.routes.active = true;
      config.outputs.api.apis = {
        folder: `${config.srcRoot}/controllers`,
        active: true,
      };
      config.outputs.api.models.active = true;
    }
  } else {
    // default to graphql
    config.outputs.api.typedefs.active = true;
  }

  if (library) {
    config.library = library;
  }

  if (frontEnd) {
    if (frontEnd === 'no') {
      // remove frontend
      config.outputs.frontEnd.framework.active = false;
      config.outputs.frontEnd.hooks.active = false;
      config.outputs.frontEnd.apiObjects.active = false;
      config.outputs.frontEnd.stateManagement.active = false;
      config.outputs.frontEnd.UI_Library.active = false;
    } else {
      config.frontEnd.framework = frontEnd;
      const isGraphql = apiType === ApiTypesEnum.graphql;
      switch (frontEnd) {
        case FrameworksEnum.react:
          config.frontEnd.clientLibrary = isGraphql
            ? ClientLibrariesEnum.apollo_client
            : ClientLibrariesEnum.axios;
          break;
        case FrameworksEnum.vue:
          config.frontEnd.clientLibrary = isGraphql
            ? ClientLibrariesEnum.vue_apollo
            : ClientLibrariesEnum.axios;
          break;
        case FrameworksEnum.svelte:
          config.frontEnd.clientLibrary = isGraphql
            ? ClientLibrariesEnum.svelte_apollo
            : ClientLibrariesEnum.axios;
          break;
        case FrameworksEnum.solid:
          config.frontEnd.clientLibrary = isGraphql
            ? ClientLibrariesEnum.solid_apollo
            : ClientLibrariesEnum.axios;
          break;
      }
    }
  }

  if (infra) {
    // manage infra here
  }

  try {
    fs.writeFileSync(
      configPath || 'scaffold.config.json',
      JSON.stringify(config, null, 2),
      'utf-8',
    );
    console.log('configuration file created at /scaffold.config.json');
  } catch (error) {
    console.error('Error creating base configuration file.');
  }

  return config;
};
