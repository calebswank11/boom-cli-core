import {
  EndpointTypesEnum,
  ReadEndpointTypes,
  WriteEndpointTypes,
} from '../../../@types/endpoints';
import { APIArgument, APINameBase, DataServicesBase } from '../../../@types';
import { DataServicesRegistry } from '../../../registries';
import { snakeToCamel, snakeToPascalCase } from '../../../utils/stringUtils';

export class DataServiceFactory {
  private static getHelperName({ prefix, name, suffix }: APINameBase) {
    return snakeToCamel(`${prefix}_${name}_${suffix}`);
  }

  static getDataServiceByHelperFunction(
    type: (ReadEndpointTypes & WriteEndpointTypes) | string,
    apiName: APINameBase,
    args: APIArgument[],
    folder: string,
  ): void {
    const dataServiceRegistry = DataServicesRegistry.getInstance();
    const baseDataServiceType: Partial<DataServicesBase> = {
      functionName: this.getHelperName(apiName),
      functionArgs: args.map((arg) => arg.name),
      typescriptType: snakeToPascalCase(apiName.name),
      folder,
      apiName,
      args,
    };
    switch (type) {
      case EndpointTypesEnum.CREATE_MANY:
        baseDataServiceType.type = EndpointTypesEnum.CREATE_MANY;
        break;
      case EndpointTypesEnum.UPDATE_MANY:
        baseDataServiceType.type = EndpointTypesEnum.UPDATE_MANY;
        break;
      case EndpointTypesEnum.DELETE_MANY:
        baseDataServiceType.type = EndpointTypesEnum.DELETE_MANY;
        break;
      case EndpointTypesEnum.FIND_MANY:
        baseDataServiceType.type = EndpointTypesEnum.FIND_MANY;
        break;
      case EndpointTypesEnum.COUNT:
        baseDataServiceType.type = EndpointTypesEnum.COUNT;
        break;
      case EndpointTypesEnum.DELETE:
        baseDataServiceType.type = EndpointTypesEnum.DELETE;
        break;
      case EndpointTypesEnum.CREATE:
        baseDataServiceType.type = EndpointTypesEnum.CREATE;
        break;
      case EndpointTypesEnum.UPDATE:
        baseDataServiceType.type = EndpointTypesEnum.UPDATE;
        break;
      default:
      case EndpointTypesEnum.ID:
        baseDataServiceType.type = EndpointTypesEnum.ID;
        break;
    }
    dataServiceRegistry.addDataService(baseDataServiceType as DataServicesBase);
  }
}
