import {
  APIArgument,
  APIData,
  ClientAPIHookData, EnumData,
  FeComponentData,
  FePageData,
  FeRouteData,
  IDataRegistry,
  TableStructureBase,
  TypescriptData,
} from '../@types';

// There is alot going on here, I would like this to be broken out into chunks but for now, this will work.
// example fo what would be nice
// class FrontendRegistry extends DataRegistry {
//  this.getComponents;
//  this.getHooks
//  this.addPage
//  etc. etc.
// }
export class DataRegistry {
  private static instance: DataRegistry;
  private structure: IDataRegistry;

  private constructor(initialData?: IDataRegistry) {
    this.structure = initialData || {
      tables: {},
      apis: {},
      apiMethods: {},
      typescript: {},
      enums: {},
      relationships: {
        tableToApi: {},
        apiToTable: {},
        apiToTypes: {},
        typeToApis: {},
        feApiMapsToApis: {},
        hookToApis: {},
      },
      frontend: {
        components: {},
        apiHooks: {},
        pages: {},
        routes: {},
      },
    };
  }

  public static getInstance(initialData?: IDataRegistry): DataRegistry {
    if (!DataRegistry.instance) {
      DataRegistry.instance = new DataRegistry(initialData);
    }
    return DataRegistry.instance;
  }

  // Get all table names
  getAllTableNames(): string[] {
    return Object.keys(this.structure.tables);
  }

  getAllTables(): TableStructureBase[] {
    return Object.values(this.structure.tables);
  }

  // Get table by name
  getTable(tableName: string): TableStructureBase | null {
    return this.structure.tables[tableName] || null;
  }
  getTableColumn(
    tableName: string,
    columnName: string,
  ): TableStructureBase['columns'][string] | null {
    return this.structure.tables[tableName].columns[columnName] || null;
  }

  // Get API by name
  getApi(apiName: string): APIData | null {
    return this.structure.apis[apiName] || null;
  }

  // Get all API names
  getAllApiNames(): string[] {
    return Object.keys(this.structure.apis);
  }

  // Get all APIs
  getAllApis(): APIData[] {
    return Object.values(this.structure.apis);
  }

  getApisByFolder(folderName: string): APIData[] {
    return Object.values(this.structure.apis).filter(
      (api) => api.folders.parent === folderName,
    );
  }

  getTypescript() {
    return this.structure.typescript;
  }

  getTypescriptByName(tsName: string) {
    return this.structure.typescript[tsName];
  }

  getTypescriptValueByName(tsName: string, valueName: string) {
    return this.structure.typescript[tsName].values[valueName] || null;
  }

  // Get related APIs for a given table
  getApisForTable(tableName: string): string[] {
    return this.structure.relationships.tableToApi[tableName] || [];
  }

  // Get related Types for an API
  getTypesForApi(apiName: string): string[] {
    return this.structure.relationships.apiToTypes[apiName] || [];
  }

  // Get API methods available
  getApiMethods(): string[] {
    return Object.keys(this.structure.apiMethods);
  }

  getApiArgumentsByApi(apiName: string): APIArgument[] | null {
    const args = this.structure.apis[apiName].args;
    if (args) return Object.values(args);
    return null;
  }

  // Get Enum values
  getEnumValues(enumName: string): string[] | null {
    return this.structure.enums[enumName]?.values || null;
  }

  getEnumValueByName(enumName: string): EnumData | null {
    return this.structure.enums[enumName] || null;
  }

  getEnumValuesByNames(enumNames: string[]): EnumData[] | null {
    return enumNames.map(enumName => this.structure.enums[enumName]) || null;
  }

  getTableToApiRelationship(tableName: string): string[] | null {
    return this.structure.relationships.tableToApi[tableName] || null;
  }

  getApiToTableRelationship(apiName: string): string | null {
    return this.structure.relationships.apiToTable[apiName] || null;
  }

  getAllApiToTableRelationships() {
    return this.structure.relationships.apiToTable;
  }

  getApiToTypesRelationship(apiName: string): string[] | null {
    return this.structure.relationships.apiToTypes[apiName] || null;
  }

  getTypesToApiRelationship(typeName: string): string[] | null {
    return this.structure.relationships.typeToApis[typeName] || null;
  }

  getComponent(componentName: string): FeComponentData | null {
    return this.structure.frontend.components[componentName] || null;
  }

  getHook(hookName: string): ClientAPIHookData | null {
    return this.structure.frontend.apiHooks[hookName] || null;
  }

  getHooks(): ClientAPIHookData[] | null {
    return Object.values(this.structure.frontend.apiHooks) || null;
  }

  getPage(pageName: string): FePageData | null {
    return this.structure.frontend.pages[pageName] || null;
  }

  getRoute(routeName: string): FeRouteData | null {
    return this.structure.frontend.routes[routeName] || null;
  }

  // Add a new table dynamically
  addTable(tableName: string, tableData: IDataRegistry['tables'][string]) {
    this.structure.tables[tableName] = tableData;
  }

  addTables(tables: Record<string, TableStructureBase>) {
    this.structure.tables = tables;
  }

  addTableToApiRelationships(tablesToApis: Record<string, string[]>) {
    this.structure.relationships.tableToApi = tablesToApis;
  }

  addApiToTableRelationships(apisToTables: Record<string, string>) {
    this.structure.relationships.apiToTable = apisToTables;
  }

  // Add a new API dynamically
  addApi(apiName: string, apiData: IDataRegistry['apis'][string]) {
    this.structure.apis[apiName] = apiData;
  }

  addApis(apiData: Record<string, APIData>) {
    this.structure.apis = apiData;
  }

  addTypescript(typescript: Record<string, TypescriptData>) {
    this.structure.typescript = typescript;
  }

  addHookToApiRelationship(hookName: string, apiName: string) {
    this.structure.relationships.hookToApis[hookName] = apiName;
  }

  addHooks(hooks: Record<string, ClientAPIHookData>) {
    this.structure.frontend.apiHooks = hooks;
  }

  addEnums(enumData: Record<string, EnumData>) {
    this.structure.enums = enumData;
  }

  // Check if a table exists
  hasTable(tableName: string): boolean {
    return !!this.structure.tables[tableName];
  }

  // Check if an API exists
  hasApi(apiName: string): boolean {
    return !!this.structure.apis[apiName];
  }

  // Debugging helper
  logDataRegistry() {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.structure);
    }
  }
}
