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

export enum RelationshipType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

export interface ValidationRule {
  type:
    | 'required'
    | 'min'
    | 'max'
    | 'minLength'
    | 'maxLength'
    | 'pattern'
    | 'custom';
  value?: any;
  required?: boolean;
  message: string;
  customValidator?: 'between_numbers' | 'phone' | 'email' | 'length_check' | 'enum_check'; // Reference to a custom validation function
}

export interface TableRelationship {
  type: RelationshipType;
  sourceTable: string;
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
  junctionTable?: string; // For many-to-many
  navigationPropertySource?: string; // Property name in source model
  navigationPropertyTarget?: string; // Property name in target model
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

export interface TableConstraint {
  name: string;
  type: string;
  expression: string | undefined;
}
export interface TableColumnStructureBase {
  fileOriginatorName?: string;
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  autoIncrement?: boolean;
  type: TableColumnTypeBase;
  enumValues?: string[];
  enumName?: string;
  primary: boolean;
  unique: boolean;
  reference?: {
    tableName: string;
    colName: string;
    constraintName?: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    inline?: boolean;
  };
  nullable: boolean;
  default?: string;
  indexes?: {
    name: string;
    columns: string[];
    unique: boolean;
    method?: 'btree' | 'hash' | 'gin' | 'gist' | string | null;
  };
  relationships?: TableRelationship[];
  validationRules?: ValidationRule[];
  description?: string;
  example?: any;
  sensitiveData?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  rawDefinition?: string;
  inputType?: 'text' | 'email' | 'textarea' | 'select' | 'date' | 'checkbox' | 'number';
  isRequired?: boolean;
}

export interface TableStructureBase {
  fileOriginatorName: string;
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  columns: Record<string, TableColumnStructureBase>;
  description?: string;
  relationships?: TableRelationship[];
  constraints?: TableConstraint[];
  softDelete?: {
    enabled: boolean;
    column?: string;
    default?: boolean;
  };
}

export type TableStructureByFile = Record<string, TableStructureBase[]>;

export interface APISecurityConfig {
  requiresAuth: boolean;
  roles: string[];
  permissions: string[];
  rateLimit?: {
    maxRequests: number;
    timeWindow: string; // e.g., "1m", "1h"
  };
}

export interface APIArgument {
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  helperFunctionNameBase: string;
  type: string;
  required: boolean;
  argWithType: [argName: string, argType: string];
  description?: string;
  example?: any;
  validationRules?: ValidationRule[];
  defaultValue?: any;
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

export interface APIPagination {
  enabled: boolean;
  defaultPageSize: number;
  maxPageSize: number;
  strategy: 'offset' | 'cursor' | 'keyset';
  cursorField?: string;
}

export interface APISecurityConfig {
  requiresAuth: boolean;
  roles: string[];
  permissions: string[];
  rateLimit?: {
    maxRequests: number;
    timeWindow: string; // e.g., "1m", "1h"
  };
  cors?: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowCredentials: boolean;
  };
}

export interface APIDocumentation {
  summary: string;
  description: string;
  tags: string[];
  exampleRequests: Record<string, any>;
  exampleResponses: Record<string, any>;
  parameters?: Record<string, {
    description: string;
    example?: any;
  }>;
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
  // new
  security?: APISecurityConfig;
  documentation?: APIDocumentation;
  pagination?: APIPagination;
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
  // new
  description?: string;
  example?: any;
  validationRules?: ValidationRule[];
}

export interface TypescriptData {
  name: string;
  tableName: string;
  values: {
    [key: string]: TypescriptValue;
  };
  parentFolder: string;
  exportFolder: string;
  // new
  description?: string;
  extends?: string[];
  implements?: string[];
  decorators?: string[];
  generics?: string[];
  documentation?: {
    usage: string;
    examples: string[];
  };
}

export interface EnumData {
  enumDictName: string;
  enumName: string;
  enumBaseName: string;
  tableName: string;
  graphQLEnumTypeName?: string;
  frontendName?: string; // Optional mapping if frontend enums differ
  values: string[];
  // new
  description?: string;
  valueDescriptions?: Record<string, string>;
  displayNames?: Record<string, string>;
  sortOrder?: string[];
  grouping?: Record<string, string[]>;
}

export interface ComponentProp {
  type: string;
  required: boolean;
  default?: any;
  // new
  description?: string;
  validationRules?: ValidationRule[];
}

export interface FeComponentData {
  name: string;
  pascalCase: string;
  camelCase: string;
  // new
  description?: string;
  parentComponent?: string;
  childComponents?: string[];
  // --
  path: string;
  props: {
    [propName: string]: ComponentProp;
  };
  // new
  lifecycle?: {
    hasEffects: boolean;
    hasMemo: boolean;
    hasCallbacks: boolean;
  };
}

// new
export interface FormConfig {
  validationSchema: string;
  initialValues: Record<string, any>;
  submitEndpoint: string;
  fieldGroups: string[][];
  errorHandling: {
    displayStrategy: 'inline' | 'summary' | 'both';
    customErrorMessages?: Record<string, string>;
  };
  submitStrategy: 'onSubmit' | 'onChange' | 'onBlur';
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
  // new
  caching?: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'localStorage' | 'sessionStorage';
  };
  optimisticUpdates?: boolean;
  retry?: {
    count: number;
    delay: number;
    backoffFactor: number;
  };
}
export interface ClientAPIHookDataRobust extends ClientAPIHookData {
  typescript: TypescriptData;
  arguments: APIArgument[];
  parentFolder?: string;
}
// new
export interface FePageLayout {
  name: string;
  areas: string[];
  components: Record<string, string>;
  responsive?: {
    breakpoints: Record<string, string>;
    mobileFirst: boolean;
  };
}

export interface FePageData {
  route: string;
  layout: string;
  components: string[];
  // new
  title: string;
  description?: string;
  metaTags?: Record<string, string>;
  preloadData?: string[];
  lazyComponents?: string[];
  animations?: Record<string, string>;
}
export interface FeRouteData {
  page: string;
  authRequired: boolean;
  // new
  roles?: string[];
  permissions?: string[];
  redirectIfUnauthorized?: string;
  preload?: boolean;
  lazy?: boolean;
  exact?: boolean;
  analytics?: {
    trackPageView: boolean;
    customEvents?: string[];
  };
}

export interface IDataRegistry {
  tables: { // complete
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
    tableDependencies: {
      [tableName: string]: string[]; // Tables that depend on this table
    };
    tableRelationships: {
      [tableName: string]: TableRelationship[];
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

    componentComposition: {
      [componentName: string]: {
        parents: string[];
        children: string[];
      };
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
    layouts: {
      [layoutName: string]: FePageLayout;
    };
    forms: {
      [formName: string]: FormConfig;
    };
    accessibility?: {
      ariaRoles?: Record<string, string>;
      ariaProps?: Record<string, string>;
      a11yLevel: 'A' | 'AA' | 'AAA';
    };
    theme: {
      colors: Record<string, string>;
      typography: {
        fontFamilies: Record<string, string>;
        fontSizes: Record<string, string>;
      };
      spacing: Record<string, string>;
      breakpoints: Record<string, string>;
      components: Record<string, any>;
    };
    navigation: {
      menus: Record<
        string,
        {
          items: Array<{
            label: string;
            path: string;
            icon?: string;
            roles?: string[];
          }>;
        }
      >;
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
      generator: string; // Template or function that generated this file
      checksum?: string; // For detecting manual changes
    };
  };
  plugins?: {
    [pluginName: string]: {
      type: 'pre-gen' | 'post-gen';
      hook: 'onApiCreate' | 'onTableCreate' | 'onFileWrite';
      execute: (context: any) => void;
      config?: Record<string, any>;
    };
  };
  environments?: {
    [env: string]: {
      baseUrl: string;
      databaseUrl: string;
      featureFlags: string[];
      // Added environment configuration
      apiUrl: string;
      auth: {
        provider: string;
        config: Record<string, any>;
      };
      storage: {
        provider: string;
        buckets: string[];
      };
      secretsManager: {
        provider: string;
        prefix: string;
      };
    };
  };
  templateMetadata?: {
    [templateName: string]: {
      type: 'backend' | 'frontend' | 'infra';
      generatedBy: 'default' | 'custom' | 'ai';
      lastModifiedByUser: boolean;
      aiRecommendations?: string[];
      version: string;
      dependencies: Record<string, string>;
      // example
      // templateMetadata["src/services/userService.ts"].aiRecommendations.push(
      //   "Refactor getUser function to use caching for performance improvements."
      // );
    };
  };
  testing: {
    unit?: {
      framework: 'Jest' | 'Mocha' | 'Vitest';
      coverageThreshold: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
      };
      directories: string[];
    };
    integration?: {
      framework: 'Supertest' | 'Cypress' | 'Playwright';
      requiredMocks: string[];
      endpoints: string[];
    };
    e2e?: {
      framework: 'Cypress' | 'Playwright';
      scenarios: string[];
      devices: string[];
      browsers: string[];
    };
    performance?: {
      tool: 'k6' | 'JMeter' | 'Lighthouse';
      scenarios: Record<string, {
        vus: number;
        duration: string;
        thresholds: Record<string, string>;
      }>;
    };
  };
  documentation: {
    openapi?: {
      version: '3.0.0' | '3.1.0';
      servers: Array<{
        url: string;
        description: string;
      }>;
      info: {
        title: string;
        version: string;
        description: string;
      };
    };
    readme?: {
      sections: string[];
      examples: Record<string, string>;
    };
    architecture?: {
      diagrams: string[];
      components: string[];
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
