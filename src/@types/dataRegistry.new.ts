export enum SqlDataType {
  // Numeric types
  INT = 'INT',
  SMALLINT = 'SMALLINT',
  BIGINT = 'BIGINT',
  SERIAL = 'SERIAL',
  BIGSERIAL = 'BIGSERIAL',
  DECIMAL = 'DECIMAL',
  NUMERIC = 'NUMERIC',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE PRECISION',
  REAL = 'REAL',

  // String types
  VARCHAR = 'VARCHAR',
  CHAR = 'CHAR',
  TEXT = 'TEXT',

  // Boolean type
  BOOLEAN = 'BOOLEAN',

  // Date/Time types
  DATE = 'DATE',
  TIME = 'TIME',
  TIMESTAMP = 'TIMESTAMP',
  TIMESTAMPTZ = 'TIMESTAMPTZ',
  INTERVAL = 'INTERVAL',

  // JSON types
  JSON = 'JSON',
  JSONB = 'JSONB',

  // Binary data types
  UUID = 'UUID',
  BYTEA = 'BYTEA',

  // Other types
  ENUM = 'ENUM',
  ARRAY = 'ARRAY',
  POINT = 'POINT',
  LINE = 'LINE',
  POLYGON = 'POLYGON',
  CIDR = 'CIDR',
  INET = 'INET',
  MACADDR = 'MACADDR',
  XML = 'XML',
  TSVECTOR = 'TSVECTOR',
}

export enum RelationshipType {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_ONE = 'MANY_TO_ONE',
  MANY_TO_MANY = 'MANY_TO_MANY'
}

export enum ColumnChangeType {
  ADDED = 'ADDED',
  REMOVED = 'REMOVED',
  MODIFIED = 'MODIFIED',
  RENAMED = 'RENAMED'
}

export enum MigrationStrategy {
  DROP_CREATE = 'DROP_CREATE',
  ALTER_TABLE = 'ALTER_TABLE',
  CREATE_TEMP_MIGRATE = 'CREATE_TEMP_MIGRATE',
  CUSTOM = 'CUSTOM'
}

export type ClientLibrary = 'apollo' | 'react-query' | 'axios' | 'fetch' | 'swr' | 'rtk-query';
export type ClientMethodType = 'query' | 'mutation' | 'get' | 'post' | 'put' | 'delete';
export type ClientMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ClientErrorHandling = 'throw' | 'silent' | 'custom';

export interface TableColumnTypeBase {
  name: SqlDataType;
  limit?: number;
  precision?: number;
  scale?: number;
  enumBaseName?: string;
  enumDictName?: string;
  enumName?: string;
  arrayOf?: SqlDataType; // For ARRAY types
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: string; // Reference to a custom validation function
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
    using?: 'BTREE' | 'HASH' | 'GIN' | 'GIST' | 'SPGIST' | 'BRIN';
  }[];
  // Added fields
  description?: string;
  example?: any;
  validationRules?: ValidationRule[];
  sensitiveData?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  visibleInApi?: boolean;
  transformation?: {
    read?: string; // Transform when reading from DB
    write?: string; // Transform when writing to DB
  };
}

export interface TableRelationship {
  type: RelationshipType;
  sourceTable: string;
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
  junctionTable?: string; // For many-to-many
  cascadeOperations: boolean;
  navigationPropertySource?: string; // Property name in source model
  navigationPropertyTarget?: string; // Property name in target model
  eager?: boolean; // Whether to eagerly load this relationship
  lazyLoadingStrategy?: 'join' | 'subquery' | 'select';
}

export interface TableStructureBase {
  fileOriginatorName: string;
  name: string;
  pascalCase: string;
  camelCase: string;
  capSentenceCase: string;
  columns: Record<string, TableColumnStructureBase>;
  // Added fields
  description?: string;
  relationships?: TableRelationship[];
  expectedVolume?: 'low' | 'medium' | 'high';
  cachingStrategy?: 'none' | 'memory' | 'redis' | 'distributed';
  partitionStrategy?: {
    enabled: boolean;
    column?: string;
    type?: 'range' | 'list' | 'hash';
  };
  auditing?: {
    enabled: boolean;
    columns: string[]; // Columns to audit
    createdByColumn?: string;
    updatedByColumn?: string;
    createdAtColumn?: string;
    updatedAtColumn?: string;
  };
  versioning?: {
    enabled: boolean;
    versionColumn?: string;
  };
  softDelete?: {
    enabled: boolean;
    column?: string;
    default?: boolean;
  };
  tags?: string[]; // For documentation and organization
  tenantIsolation?: {
    enabled: boolean;
    column?: string;
  };
}

export type TableStructureByFile = Record<string, TableStructureBase[]>;

export interface SchemaVersionChange {
  changeType: ColumnChangeType;
  column: string;
  from?: TableColumnStructureBase;
  to?: TableColumnStructureBase;
  migrationStrategy: MigrationStrategy;
  dataTransformation?: string; // SQL or code to transform data during migration
  requiresDowntime?: boolean;
}

export interface SchemaVersion {
  versionId: string;
  changes: SchemaVersionChange[];
  upgradeScript?: string;
  downgradeScript?: string;
  appliedAt?: Date;
  appliedBy?: string;
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
  // Added fields
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

export interface APIVersioning {
  current: string;
  deprecated: string[];
  supportedUntil: Record<string, Date>;
  migrationPath: Record<string, string>; // old version -> new version
  versioningStrategy: 'url' | 'header' | 'param';
}

export interface APICaching {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  strategy: 'memory' | 'redis' | 'distributed';
  varyBy?: string[]; // Headers or query params to vary cache by
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

export interface APIMetrics {
  trackLatency: boolean;
  trackErrors: boolean;
  trackUsage: boolean;
  customMetrics?: Record<string, string>; // metric name -> prometheus style query
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
  // Added fields
  pagination?: APIPagination;
  security?: APISecurityConfig;
  versioning?: APIVersioning;
  caching?: APICaching;
  documentation?: APIDocumentation;
  metrics?: APIMetrics;
  idempotencySupport?: boolean;
  bulkOperations?: boolean;
  webhooks?: {
    events: string[];
    payloadSchema: any;
  };
  errorStrategy?: {
    detailedErrors: boolean;
    errorCodes: Record<string, string>;
  };
}

export interface TypescriptValue {
  name: string;
  value: any;
  graphqlFEType: string;
  graphqlBEType: string;
  nestJSParam: string;
  required?: boolean;
  enumResponse?: string;
  // Added fields
  description?: string;
  example?: any;
  validationRules?: ValidationRule[];
  sensitiveData?: boolean;
  serializationTransform?: string; // Function to transform when serializing
  deserializationTransform?: string; // Function to transform when deserializing
}

export interface TypescriptData {
  name: string;
  tableName: string;
  values: {
    [key: string]: TypescriptValue;
  };
  parentFolder: string;
  exportFolder: string;
  // Added fields
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
  frontendName?: string;
  values: string[];
  // Added fields
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
  // Added fields
  description?: string;
  validationRules?: ValidationRule[];
}

export interface FeComponentData {
  name: string;
  pascalCase: string;
  camelCase: string;
  path: string;
  props: {
    [propName: string]: ComponentProp;
  };
  // Added fields
  description?: string;
  parentComponent?: string;
  childComponents?: string[];
  styles?: {
    framework: 'css' | 'sass' | 'styled-components' | 'tailwind' | 'emotion';
    file?: string;
  };
  stateManagement?: {
    type: 'local' | 'redux' | 'context' | 'recoil' | 'mobx';
    slices?: string[];
  };
  lifecycle?: {
    hasEffects: boolean;
    hasMemo: boolean;
    hasCallbacks: boolean;
  };
  accessibility?: {
    ariaRoles?: Record<string, string>;
    ariaProps?: Record<string, string>;
    a11yLevel: 'A' | 'AA' | 'AAA';
  };
}

export interface StateManagement {
  storeSlices: string[];
  reducers: Record<string, {
    actions: string[];
    initialState: any;
  }>;
  selectors: Record<string, {
    dependencies: string[];
    memoized: boolean;
  }>;
  effects: Record<string, {
    triggers: string[];
    async: boolean;
  }>;
}

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
  resetOnSubmit: boolean;
}

export interface I18nSupport {
  languages: string[];
  defaultLanguage: string;
  resourceKeys: string[];
  translationStrategy: 'static' | 'dynamic';
  namespaces?: string[];
  fallbackLanguage?: string;
}

export interface ClientAPIHookData {
  client: ClientLibrary;
  operationName: string;
  apiName: string;
  apiRootName: string;
  apolloFunction?: string;
  url?: string;
  method?: ClientMethod;
  type: ClientMethodType;
  args: string[];
  typeName: string;
  hasPagination?: boolean;
  isLazy?: boolean;
  headers?: Record<string, string>;
  queryParams?: boolean;
  errorHandling?: ClientErrorHandling;
  // Added fields
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
  polling?: {
    enabled: boolean;
    interval: number;
  };
  debounce?: {
    enabled: boolean;
    wait: number;
    maxWait?: number;
  };
  throttle?: {
    enabled: boolean;
    wait: number;
  };
  dependencies?: string[]; // Other hooks this depends on
}

export interface ClientAPIHookDataRobust extends ClientAPIHookData {
  typescript: TypescriptData;
  arguments: APIArgument[];
  parentFolder?: string;
}

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
  // Added fields
  title: string;
  description?: string;
  metaTags?: Record<string, string>;
  preloadData?: string[];
  lazyComponents?: string[];
  animations?: {
    pageEnter?: string;
    pageExit?: string;
  };
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    structuredData?: any;
  };
}

export interface FeRouteData {
  page: string;
  authRequired: boolean;
  // Added fields
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

export interface MultiTenancyConfig {
  strategy: 'database' | 'schema' | 'row-level';
  tenantIdColumn: string;
  tenantIsolation: 'strict' | 'permissive';
  tenantIdentifier: {
    source: 'header' | 'param' | 'subdomain' | 'path';
    name: string;
  };
  defaultTenant?: string;
}

export interface DataSeedConfig {
  environment: 'development' | 'testing' | 'production';
  seedFiles: string[];
  seedOrder: string[];
  resetStrategy: 'truncate' | 'delete' | 'none';
  conditionalSeeding?: Record<string, string>; // Table -> condition
  seedOnce?: boolean;
}

export interface FeatureFlags {
  name: string;
  description: string;
  defaultValue: boolean;
  environments: {
    [env: string]: boolean;
  };
  rolloutPercentage?: number;
  dependencies?: string[];
  expiration?: Date;
}

export interface Observability {
  metrics: string[];
  logLevels: Record<string, string>;
  alertThresholds: Record<string, number>;
  healthChecks: {
    path: string;
    expectedResponse: any;
    interval: number;
  }[];
  tracing?: {
    enabled: boolean;
    sampleRate: number;
  };
  dashboards?: string[];
}

export interface SecurityConfig {
  encryption: {
    atRest: boolean;
    inTransit: boolean;
    fields: string[];
    algorithm?: string;
    keyRotation?: {
      enabled: boolean;
      intervalDays: number;
    };
  };
  compliance: string[]; // e.g., ['GDPR', 'HIPAA', 'SOC2']
  dataRetention: Record<string, string>; // table -> retention period
  dataClassification?: Record<string, 'public' | 'internal' | 'confidential' | 'restricted'>;
  accessControl?: {
    strategy: 'RBAC' | 'ABAC' | 'ACL';
    defaultPolicy: 'allow' | 'deny';
  };
}

export interface ExternalServiceConfig {
  name: string;
  type: 'payment' | 'email' | 'storage' | 'analytics' | 'other';
  apiKeys: Record<string, string>;
  endpoints: Record<string, string>;
  retry: {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  timeout: number;
  circuitBreaker?: {
    enabled: boolean;
    failureThreshold: number;
    resetTimeout: number;
  };
  fallback?: {
    enabled: boolean;
    strategy: string;
  };
}

export interface WebhookConfig {
  events: string[];
  payloadSchema: any;
  security: {
    signatureHeader: string;
    signatureAlgorithm: string;
  };
  retries: {
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
  };
  timeout: number;
  batchProcessing?: {
    enabled: boolean;
    maxBatchSize: number;
    delayMs: number;
  };
}

export interface MessageQueueConfig {
  provider: 'SQS' | 'RabbitMQ' | 'Kafka' | 'Redis';
  topics: string[];
  consumers: Record<string, string>;
  producers: Record<string, string>;
  dlq: boolean;
  retryPolicy: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    multiplier: number;
  };
  batchSize?: number;
  messageSchema?: Record<string, any>;
}

export interface InfrastructureConfig {
  provider: 'AWS' | 'GCP' | 'Azure' | 'DigitalOcean' | 'Kubernetes';
  services: string[];
  region: string;
  scale: {
    min: number;
    max: number;
    targetCpu: number;
  };
  networking: {
    vpc?: string;
    subnets?: string[];
    securityGroups?: string[];
  };
  database: {
    type: 'PostgreSQL' | 'MySQL' | 'MongoDB' | 'DynamoDB';
    version: string;
    size: string;
    replicas: number;
    backups: {
      enabled: boolean;
      retentionDays: number;
      schedule: string;
    };
  };
  cache?: {
    type: 'Redis' | 'Memcached';
    size: string;
    clusterMode: boolean;
  };
  cdn?: {
    enabled: boolean;
    domains: string[];
  };
}

export interface DeploymentConfig {
  method: 'Docker' | 'Serverless' | 'Kubernetes';
  ci: {
    provider: 'GitHub Actions' | 'GitLab CI/CD' | 'CircleCI' | 'Jenkins';
    buildSteps: string[];
    testSteps: string[];
    deploySteps: string[];
  };
  artifacts: {
    type: 'Docker Image' | 'ZIP' | 'NPM Package';
    registry?: string;
  };
  environments: {
    [env: string]: {
      domain: string;
      variables: Record<string, string>;
      infrastructure: {
        size: string;
        replicas: number;
      };
    };
  };
  rollback: {
    automatic: boolean;
    criteria: string[];
  };
  blueGreen?: {
    enabled: boolean;
    testPercentage: number;
  };
  canary?: {
    enabled: boolean;
    stages: number[];
  };
}

export interface ApiMonitoring {
  responseTime: {
    warning: number; // ms
    critical: number; // ms
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  availability: {
    target: number; // percentage
  };
  customMetrics: Record<string, {
    query: string;
    thresholds: {
      warning: number;
      critical: number;
    };
  }>;
}

export interface BackupConfig {
  database: {
    schedule: string; // cron expression
    retention: number; // days
    type: 'full' | 'incremental';
    location: string;
  };
  files: {
    schedule: string;
    retention: number;
    location: string;
  };
  testing: {
    schedule: string;
    automatic: boolean;
  };
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
    // Added relationships
    tableDependencies: {
      [tableName: string]: string[]; // Tables that depend on this table
    };
    tableRelationships: {
      [tableName: string]: TableRelationship[];
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
    // Added frontend configuration
    layouts: {
      [layoutName: string]: FePageLayout;
    };
    stateManagement: StateManagement;
    forms: {
      [formName: string]: FormConfig;
    };
    i18n: I18nSupport;
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
      menus: Record<string, {
        items: Array<{
          label: string;
          path: string;
          icon?: string;
          roles?: string[];
        }>;
      }>;
    };
    featureFlags: {
      [flagName: string]: FeatureFlags;
    };
  };

  schemaHistory: {
    [tableName: string]: {
      versions: {
        [versionId: string]: SchemaVersion;
      };
      currentVersion: string;
    };
  };

  fileGenerationMap: {
    [filePath: string]: {
      type: 'backend' | 'frontend' | 'infra';
      dependsOn: string[]; // Other files this one depends on
      lastUpdated: string; // Timestamp of last modification
      generator: string; // Template or function that generated this file
      checksum?: string; // For detecting manual changes
    };
  };

  plugins: {
    [pluginName: string]: {
      type: 'pre-gen' | 'post-gen';
      hook: 'onApiCreate' | 'onTableCreate' | 'onFileWrite';
      execute: (context: any) => void;
      config?: Record<string, any>;
    };
  };

  environments: {
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

  templateMetadata: {
    [templateName: string]: {
      type: 'backend' | 'frontend' | 'infra';
      generatedBy: 'default' | 'custom' | 'ai';
      lastModifiedByUser: boolean;
      aiRecommendations?: string[];
      version: string;
      dependencies: Record<string, string>;
    };
  };

  // Added configuration sections
  multiTenancy: MultiTenancyConfig;

  dataSeed: DataSeedConfig;

  security: SecurityConfig;

  observability: Observability;

  externalServices: {
    [serviceName: string]: ExternalServiceConfig;
  };

  webhooks: {
    [webhookName: string]: WebhookConfig;
  };

  messageQueues: {
    [queueName: string]: MessageQueueConfig;
  };

  infrastructure: InfrastructureConfig;

  deployment: DeploymentConfig;

  monitoring: {
    apis: Record<string, ApiMonitoring>;
    services: Record<string, any>;
    notifications: {
      channels: Record<string, {
        type: 'email' | 'slack' | 'pagerduty';
        config: any;
      }>;
      routing: Record<string, string[]>;
    };
  };

  backup: BackupConfig;

  caching: {
    strategy: 'memory' | 'redis' | 'distributed';
    ttl: Record<string, number>;
    keys: Record<string, string>;
    invalidation: Record<string, string[]>;
  };

  testing: {
    unit: {
      framework: 'Jest' | 'Mocha' | 'Vitest';
      coverageThreshold: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
      };
      directories: string[];
    };
    integration: {
      framework: 'Supertest' | 'Cypress' | 'Playwright';
      requiredMocks: string[];
      endpoints: string[];
    };
    e2e: {
      framework: 'Cypress' | 'Playwright';
      scenarios: string[];
      devices: string[];
      browsers: string[];
    };
    performance: {
      tool: 'k6' | 'JMeter' | 'Lighthouse';
      scenarios: Record<string, {
        vus: number;
        duration: string;
        thresholds: Record<string, string>;
      }>;
    };
  };

  documentation: {
    openapi: {
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
    readme: {
      sections: string[];
      examples: Record<string, string>;
    };
    architecture: {
      diagrams: string[];
      components: string[];
    };
  };
}
