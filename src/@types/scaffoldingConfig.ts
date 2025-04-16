import {
  ApiType,
  AuthMethod,
  CI_CD,
  ClientLibrary,
  CloudProvider,
  DeploymentTarget,
  Framework,
  IaCTool,
  Library,
  License,
  Orm,
  RateLimiting,
  StateManagement,
  UILibrary,
} from './cli.types';

export type FeatureToggle = boolean;
// NOTE: these are used temporarily until this is resolved but dont want random errors because this type does not exist yet.
export type APIType = ApiType;
export type ORM = Orm;

export interface ScaffoldingConfig {
  project: {
    name: string;
    type: 'ts' | 'js';
    license: License;
  };
  inputRoot: string;
  srcRoot: string;
  root: string;
  rootFrontend: string;
  orm: ORM;
  library: Library;
  apiType: APIType;
  outputs: {
    types: { folder: string; active: FeatureToggle };
    enums: { folder: string; active: FeatureToggle };
    config: { folder: string; active: FeatureToggle };
    api: {
      migrations: {
        folder: string;
        active: FeatureToggle;
      };
      seeds: {
        folder: string;
        dev: FeatureToggle;
        staging: FeatureToggle;
        prod: FeatureToggle;
      };
      apis: { folder: string; active: FeatureToggle };
      typedefs: { folder: string; active: FeatureToggle };
      helperFunctions: { folder: string; active: FeatureToggle };
      tests: FeatureToggle;
    };
    admin?: {
      scaffold: FeatureToggle;
    };
    frontEnd: {
      framework: { folder: string; active: FeatureToggle };
      hooks: { folder: string; active: FeatureToggle };
      apiObjects: { folder: string; active: FeatureToggle };
      stateManagement: { folder: string; active: FeatureToggle };
      UI_Library: { folder: string; active: FeatureToggle };
    };
    devops?: {
      CICD: FeatureToggle;
      infra: FeatureToggle;
    };
  };
  frontEnd: {
    framework: Framework;
    clientLibrary: ClientLibrary;
    hooks: FeatureToggle;
    apiObjects: FeatureToggle;
    stateManagement: StateManagement;
    UI_Library: UILibrary;
  };
  database: {
    dialect: ORM;
    connection: string;
    pooling: {
      min: number;
      max: number;
    };
    logging: FeatureToggle;
  };
  apiLayer: {
    versioning: FeatureToggle;
    authentication: AuthMethod;
    rateLimiting: RateLimiting;
    caching: FeatureToggle;
    errorHandling: FeatureToggle;
  };
  codeStyle: {
    indentation: 'tabs' | 'spaces';
    lineLength: number;
    linting: FeatureToggle;
    strictTypes: FeatureToggle;
  };
  deployment: {
    docker: FeatureToggle;
    CI_CD: CI_CD;
    hosting: DeploymentTarget;
  };
  infrastructure: {
    provider: CloudProvider;
    iac: IaCTool;
    services: {
      database: boolean;
      storage: boolean;
      functions: boolean;
      containerization: boolean;
      networking: boolean;
    };
  };
}
