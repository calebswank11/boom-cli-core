import {
  AgnosticEndpointTypesEnum,
  ClientErrorHandling,
  ClientLibrariesEnum,
  ClientLibrary,
  ClientMethodType,
  EndpointTypesEnum,
  Framework,
  FrameworksEnum,
  ReadEndpointTypes,
  WriteEndpointTypes,
} from '../../@types';

export class ClientFactory {
  static getClientLibrary(
    library: ClientLibrary,
    framework: Framework,
  ): ClientLibrary {
    switch (framework) {
      case FrameworksEnum.vue:
        return ClientLibrariesEnum.vue_apollo;
      case FrameworksEnum.svelte:
        return ClientLibrariesEnum.svelte_apollo;
      case FrameworksEnum.solid:
        return ClientLibrariesEnum.solid_apollo;
      case FrameworksEnum.react:
        return ClientLibrariesEnum.apollo_client;
      default:
        return library;
    }
  }

  static getMethod(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    isGraphql?: boolean,
  ): ClientMethodType {
    switch (method) {
      case EndpointTypesEnum.DELETE_MANY:
      case EndpointTypesEnum.DELETE:
        return isGraphql
          ? AgnosticEndpointTypesEnum.MUTATION
          : AgnosticEndpointTypesEnum.DELETE;
      case EndpointTypesEnum.UPDATE:
      case EndpointTypesEnum.UPDATE_MANY:
        return isGraphql
          ? AgnosticEndpointTypesEnum.MUTATION
          : AgnosticEndpointTypesEnum.PUT;
      case EndpointTypesEnum.CREATE:
      case EndpointTypesEnum.CREATE_MANY:
        return isGraphql
          ? AgnosticEndpointTypesEnum.MUTATION
          : AgnosticEndpointTypesEnum.POST;
      case EndpointTypesEnum.COUNT:
      case EndpointTypesEnum.FIND_MANY:
      default:
        return isGraphql
          ? AgnosticEndpointTypesEnum.QUERY
          : AgnosticEndpointTypesEnum.GET;
    }
  }

  static getMethodType(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    library: ClientLibrary,
  ): ClientMethodType {
    const isGraphql = library.includes('apollo');

    return ClientFactory.getMethod(method, isGraphql);
  }

  static getErrorHandling(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
  ): ClientErrorHandling {
    switch (method) {
      case EndpointTypesEnum.DELETE_MANY:
      case EndpointTypesEnum.DELETE:
      case EndpointTypesEnum.UPDATE:
      case EndpointTypesEnum.UPDATE_MANY:
      case EndpointTypesEnum.CREATE:
      case EndpointTypesEnum.CREATE_MANY:
        return 'throw';
      default:
        return 'silent';
    }
  }
}
