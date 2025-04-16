import { APIArgument, EnumData, TypescriptData, TypescriptValue } from './index';

export interface RouteArgBase extends APIArgument {}
export interface RouteBase {
  name: string;
  args: RouteArgBase[];
  functionName: string;
  type: TypescriptData;
  folder: string;
  endpointType: ReadEndpointTypes | WriteEndpointTypes | string;
}

export interface ApiMapMapBase {
  folder: string;
  fileName: string;
  template: string;
}

export interface EndpointBase {
  path: string;
  template: string;
}

export enum ReadEndpointTypes {
  FIND_MANY = 'find_many',
  ID = 'id',
  COUNT = 'count',
}
export enum WriteEndpointTypes {
  CREATE = 'create',
  DELETE = 'delete',
  UPDATE = 'update',
  CREATE_MANY = 'create_many',
  UPDATE_MANY = 'update_many',
  DELETE_MANY = 'delete_many',
}

export const AgnosticEndpointTypesEnum = {
  PUT: 'put',
  POST: 'post',
  DELETE: 'delete',
  GET: 'get',
  MUTATION: 'mutation',
  QUERY: 'query',
} as const;

export const EndpointTypesEnum = {
  ...ReadEndpointTypes,
  ...WriteEndpointTypes,
} as const;

export type EndpointTypes = keyof typeof EndpointTypesEnum;

export type HelperFunction = {
  functionName: string;
  typescriptRefKey: string;
  // ^^ can use this to check if the type is required and do dynamic fetching this way.
  args: string;
};

export type APIAggregateData = {
  imports: {
    enumImports: string[];
    typeImports: string[];
    serviceImports: string[];
    utilsImports: string[];
  };
  functionName: string;
  args: APIArgument[] | null;
  typescript: TypescriptData;
  enumData: Record<string, EnumData> | null;
  dataService: {
    name: string;
    args: string | null; // {...args} || args || id || null
  };
  helperFunctions: {
    [functionName: string]: HelperFunction;
  } | null;
};

export type APIAggregateDictionary = {
  [apiName: string]: {
    [method: string]: APIAggregateData;
  };
};
