import { ClientLibrary } from './cli.types';

export enum SqlDataType {
  INT = 'INT',
  SMALLINT = 'SMALLINT',
  BIGINT = 'BIGINT',
  SERIAL = 'SERIAL',
  BIGSERIAL = 'BIGSERIAL',

  VARCHAR = 'VARCHAR',
  CHAR = 'CHAR',
  TEXT = 'TEXT',

  BOOLEAN = 'BOOLEAN',

  DECIMAL = 'DECIMAL',
  NUMERIC = 'NUMERIC',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE PRECISION',
  REAL = 'REAL',

  DATE = 'DATE',
  TIME = 'TIME',
  TIMESTAMP = 'TIMESTAMP',
  TIMESTAMPTZ = 'TIMESTAMPTZ',

  JSON = 'JSON',
  JSONB = 'JSONB',

  UUID = 'UUID',
  BYTEA = 'BYTEA',

  ENUM = 'ENUM',
  ARRAY = 'ARRAY',
}

export interface TableColumnTypeBase {
  name: SqlDataType;
  limit?: number;
  precision?: number;
  scale?: number;
  enumBaseName?: string;
  enumDictName?: string;
  // used in code.
  enumName?: string;
}
export interface TableColumnStructureBase {
  name: string;
  autoIncrement?: boolean;
  type: TableColumnTypeBase;
  enumValues?: string[];
  primary: boolean;
  unique: boolean;
  reference?: {
    tableName: string;
    colName: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
  nullable: boolean;
  default?: string;
  indexes?: {
    name: string;
    columns: string[];
    unique: boolean;
  }[];
}

export interface TableStructureBase {
  fileOriginatorName: string;
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  columns: Record<string, TableColumnStructureBase>;
}

export type TableStructureByFile = Record<string, TableStructureBase[]>;

export interface APIArgument {
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  helperFunctionNameBase: string;
  type: string;
  required: boolean;
  argWithType: [argName: string, argType: string];
}

export interface APIFolderData {
  exportsFolder: string;
  root: string;
  parent: string;
  fetch?: string;
  write?: string;
  put?: string;
  delete?: string;
}
export interface APIData {
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  tableName: string;
  responseType: string;
  folders: APIFolderData;
  args: {
    [argName: string]: APIArgument;
  };
  byFields: string[];
  methods: string[]; // ['create', 'fetch', etc.]
}

export interface TypescriptValue {
  name: string;
  value: any;
  graphqlFEType: string;
  graphqlBEType: string;
  nestJSParam: string; // Annotation for NestJS
  required?: boolean;
  // this is for dictionary types
  // i.e: (typeof enumDict)[keyof typeof enumDict]
  enumResponse?: string;
}

export interface TypescriptData {
  name: string;
  tableName: string;
  values: {
    [key: string]: TypescriptValue;
  };
  parentFolder: string;
  exportFolder: string;
}

export interface EnumData {
  // databaseName: string;
  enumDictName: string;
  enumName: string;
  enumBaseName: string;
  tableName: string;
  graphQLEnumTypeName?: string;
  frontendName?: string; // Optional mapping if frontend enums differ
  values: string[];
}

export interface ComponentProp {
  type: string;
  required: boolean;
  default?: any;
}

export interface FeComponentData {
  name: string;
  pascalCase: string;
  camelCase: string;
  path: string;
  props: {
    [propName: string]: ComponentProp;
  };
}

export type ClientMethodType =
  | 'query'
  | 'mutation'
  | 'get'
  | 'post'
  | 'put'
  | 'delete';
export type ClientMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ClientErrorHandling = 'throw' | 'silent' | 'custom';
export interface ClientAPIHookData {
  client: ClientLibrary;
  operationName: string; // derived from api
  apiName: string;
  apiRootName: string;
  apolloFunction?: string; // ex: `MY_QUERY` or `MY_MUTATION`
  url?: string; // full or relative REST path
  method?: ClientMethod; // only needed for REST (alias to `type` when applicable)
  type: ClientMethodType; // keep this for framework-agnostic mapping
  args: string[]; // list of typed arguments
  typeName: string; // response data shape
  hasPagination?: boolean; // for hooks that will return paged data
  isLazy?: boolean; // if you want to expose lazy versions (i.e. manual trigger)
  headers?: Record<string, string>; // optional override headers for REST
  queryParams?: boolean; // for GET requests with ?params
  errorHandling?: ClientErrorHandling; // hook generation behavior for errors
}
export interface ClientAPIHookDataRobust extends ClientAPIHookData {
  typescript: TypescriptData;
  arguments: APIArgument[];
  parentFolder?: string;
}

export interface FePageData {
  route: string;
  layout: string;
  components: string[];
}
export interface FeRouteData {
  page: string;
  authRequired: boolean;
}

export interface IDataRegistry {
  tables: {
    [tableName: string]: TableStructureBase;
  };

  apis: {
    [apiName: string]: APIData;
  };

  apiMethods: {
    [methodType: string]: {
      prefix: string;
      suffix: string;
    };
  };

  typescript: {
    [typeName: string]: TypescriptData;
  };
  enums: {
    [enumName: string]: EnumData;
  };
  relationships: {
    tableToApi: {
      [tableName: string]: string[]; // Tables → APIs that use them
    };
    // used to route folders on both front and backend.
    // ex: mutations/<job>/fetchMany.ts
    apiToTable: {
      [apiName: string]: string;
    };
    apiToTypes: {
      [apiName: string]: string[]; // APIs → TypeScript types they depend on
    };
    typeToApis: {
      [typeName: string]: string[]; // TypeScript types → APIs that return/use them
    };
    feApiMapsToApis: {
      [hookName: string]: string;
    };
    hookToApis: {
      [hookName: string]: string;
    };
  };
  frontend: {
    components: {
      [componentName: string]: FeComponentData;
    };
    apiHooks: {
      [hookName: string]: ClientAPIHookData;
    };
    pages: {
      [pageName: string]: FePageData;
    };
    routes: {
      [routePath: string]: FeRouteData;
    };
  };
  // these may be used down the line, will act as placeholders for now.
  // check "boomScaffold/Future Ideas.md" in obsidian for notes
  schemaHistory?: {
    [tableName: string]: {
      versions: {
        [versionId: string]: {
          addedColumns: string[];
          removedColumns: string[];
          modifiedColumns: {
            [columnName: string]: {
              from: string;
              to: string;
            };
          };
        };
      };
    };
  };
  fileGenerationMap?: {
    [filePath: string]: {
      type: 'backend' | 'frontend' | 'infra';
      dependsOn: string[]; // Other files this one depends on
      lastUpdated: string; // Timestamp of last modification
    };
  };
  plugins?: {
    [pluginName: string]: {
      type: 'pre-gen' | 'post-gen';
      hook: 'onApiCreate' | 'onTableCreate' | 'onFileWrite';
      execute: (context: any) => void;
    };
  };
  environments?: {
    dev: {
      baseUrl: string;
      databaseUrl: string;
      featureFlags: string[];
    };
    staging: {
      baseUrl: string;
      databaseUrl: string;
      featureFlags: string[];
    };
    prod: {
      baseUrl: string;
      databaseUrl: string;
      featureFlags: string[];
    };
  };
  templateMetadata?: {
    [templateName: string]: {
      type: 'backend' | 'frontend' | 'infra';
      generatedBy: 'default' | 'custom' | 'ai';
      lastModifiedByUser: boolean;
      aiRecommendations?: string[];
      // example
      // templateMetadata["src/services/userService.ts"].aiRecommendations.push(
      //   "Refactor getUser function to use caching for performance improvements."
      // );
    };
  };
}

// this shouldn't be used yet, just an idea of where we can go and what we might need.
type additionalConfiguration = {
  cloudOps: {
    infrastructure: {
      provider: 'AWS' | 'GCP' | 'Azure';
      services: string[];
    };
    authentication: {
      provider: 'Cognito' | 'Auth0' | 'Firebase' | 'Custom';
      userRoles: string[];
    };
    storage: {
      provider: 'S3' | 'Firebase' | 'GCP Storage';
      buckets: string[];
    };
  };

  tests: {
    unit: {
      framework: 'Jest' | 'Mocha' | 'Vitest';
      coverageThreshold: number;
    };
    integration: {
      framework: 'Supertest' | 'Cypress' | 'Playwright';
      requiredMocks: string[];
    };
    e2e: {
      framework: 'Cypress' | 'Playwright';
      scenarios: string[];
    };
  };

  devOps: {
    ciCd: {
      provider: 'GitHub Actions' | 'GitLab CI/CD' | 'CircleCI';
      workflows: string[];
    };
    deployment: {
      method: 'Docker' | 'Serverless' | 'Kubernetes';
      environments: {
        dev: {
          domain: string;
          variables: Record<string, string>;
        };
        prod: {
          domain: string;
          variables: Record<string, string>;
        };
      };
    };
    monitoring: {
      provider: 'Datadog' | 'New Relic' | 'Prometheus';
      alerts: string[];
    };
  };
};
