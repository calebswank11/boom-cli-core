import {
  EndpointTypesEnum,
  ReadEndpointTypes,
  WriteEndpointTypes,
} from '../../../@types';

export class ResponseTypeFactory {
  static getResponseType(
    type: (ReadEndpointTypes & WriteEndpointTypes) | string,
    responseType: string | undefined,
  ): string {
    switch (type) {
      case EndpointTypesEnum.FIND_MANY:
      case EndpointTypesEnum.CREATE_MANY:
      case EndpointTypesEnum.UPDATE_MANY:
        return `${responseType}[]` || 'any[]';
      case EndpointTypesEnum.COUNT:
        return '{count: number}';
      case EndpointTypesEnum.DELETE:
      case EndpointTypesEnum.DELETE_MANY:
        return '{success: boolean}';
      case EndpointTypesEnum.ID:
      case EndpointTypesEnum.CREATE:
      case EndpointTypesEnum.UPDATE:
      default:
        return responseType || 'any';
    }
  }
}
