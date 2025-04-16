import {
  APIAggregateData,
  APIArgument,
  APINameBase,
  EndpointTypesEnum,
  ReadEndpointTypes,
  TableStructureBase,
  WriteEndpointTypes,
} from '../../../@types';
import { EndpointNameFactory } from './EndpointNameFactory';
import { DataRegistry } from '../../../registries/DataRegistry';

export class HelperFunctionFactory {
  private static getHelperFuncPrefix(
    type: (ReadEndpointTypes & WriteEndpointTypes) | string,
    apiName: APINameBase,
  ): APINameBase {
    switch (type) {
      case EndpointTypesEnum.CREATE_MANY:
        return {
          ...apiName,
          prefix: 'write_many',
        };
      case EndpointTypesEnum.UPDATE_MANY:
        return {
          ...apiName,
          prefix: 'put_many',
        };
      case EndpointTypesEnum.DELETE_MANY:
        return {
          ...apiName,
          prefix: 'remove_many',
        };
      case EndpointTypesEnum.FIND_MANY:
        return {
          ...apiName,
          prefix: 'fetch_many',
        };
      case EndpointTypesEnum.COUNT:
        return {
          ...apiName,
          prefix: 'fetch',
          suffix: 'count',
        };
      case EndpointTypesEnum.DELETE:
        return {
          ...apiName,
          prefix: 'remove',
        };
      case EndpointTypesEnum.CREATE:
        return {
          ...apiName,
          prefix: 'write',
        };
      case EndpointTypesEnum.UPDATE:
        return {
          ...apiName,
          prefix: 'put',
        };
      case EndpointTypesEnum.ID:
        return {
          ...apiName,
          prefix: 'fetch',
          suffix: 'by_id',
        };
      // any of these are byDate, byId, byType, etc. They will be fetches.
      default:
        return {
          ...apiName,
          prefix: 'fetch',
        };
    }
  }

  static buildHelperFunctionName(
    type: (ReadEndpointTypes & WriteEndpointTypes) | string,
    apiName: APINameBase,
  ): APINameBase {
    switch (type) {
      case EndpointTypesEnum.CREATE_MANY:
        return { ...apiName, prefix: 'write_many' };
      case EndpointTypesEnum.UPDATE_MANY:
        return { ...apiName, prefix: 'put_many' };
      case EndpointTypesEnum.DELETE_MANY:
        return { ...apiName, prefix: 'remove_many' };
      case EndpointTypesEnum.FIND_MANY:
        return { ...apiName, prefix: 'fetch_many' };
      case EndpointTypesEnum.COUNT:
        return { ...apiName, prefix: 'fetch', suffix: 'count' };
      case EndpointTypesEnum.DELETE:
        return { ...apiName, prefix: 'remove' };
      case EndpointTypesEnum.CREATE:
        return { ...apiName, prefix: 'write' };
      case EndpointTypesEnum.UPDATE:
        return { ...apiName, prefix: 'put' };
      case EndpointTypesEnum.ID:
        return { ...apiName, prefix: 'fetch', suffix: 'by_id' };
      default:
        return apiName;
    }
  }

  static getByIdFunctions(args: APIArgument[]): APIArgument[] {
    return args.filter(
      (arg) => arg.name.toLowerCase().split('_').includes('id') && arg.name !== 'id',
    );
  }

  static getHelperFunctions(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    tableColumns: TableStructureBase['columns'],
    typescriptRefKey: string,
  ): APIAggregateData['helperFunctions'] {
    return Object.values(tableColumns).reduce((acc, column) => {
      if (column.reference && column.reference.tableName) {
        const helperFunctionApiName = EndpointNameFactory.getEndpointName(
          method,
          column.reference.tableName,
        );
        const helperFunctionNameBase = HelperFunctionFactory.buildHelperFunctionName(
          // always a fetch on these.
          EndpointTypesEnum.ID,
          helperFunctionApiName,
        );
        const helperFunctionName = EndpointNameFactory.buildApiName(
          helperFunctionNameBase,
        );
        return {
          ...acc,
          [helperFunctionName]: {
            functionName: helperFunctionName,
            typescriptRefKey: typescriptRefKey,
            args: [column.name],
          },
        };
      }

      return acc;
    }, {});
  }
}
