import {
  ApiTypesEnum,
  AuthMethodsEnum,
  CI_CDOptionsEnum,
  ClientLibrariesEnum,
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

// NOTE Only used in the config registry. Can eventually remove this as it may cause issues whenever running the CLI.
export const genericScaffoldingConfig: ScaffoldingConfig = {
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
      apis: { folder: 'src/resolvers', active: true },
      typedefs: { folder: 'src/typedefs', active: true },
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
      UI_Library: { folder: 'app/components', active: true },
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
