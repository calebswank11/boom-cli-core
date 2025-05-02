import {
  AgnosticEndpointTypesEnum,
  ReadEndpointTypes,
  WriteEndpointTypes,
} from '../../@types';

export const EndpointHttpMethodMap: Record<
  ReadEndpointTypes | WriteEndpointTypes | string,
  string
> = {
  // Read operations
  [ReadEndpointTypes.FIND_MANY]: AgnosticEndpointTypesEnum.GET,
  [ReadEndpointTypes.ID]: AgnosticEndpointTypesEnum.GET,
  [ReadEndpointTypes.COUNT]: AgnosticEndpointTypesEnum.GET,

  // Write operations
  [WriteEndpointTypes.CREATE]: AgnosticEndpointTypesEnum.POST,
  [WriteEndpointTypes.CREATE_MANY]: AgnosticEndpointTypesEnum.POST,
  [WriteEndpointTypes.UPDATE]: AgnosticEndpointTypesEnum.PUT,
  [WriteEndpointTypes.UPDATE_MANY]: AgnosticEndpointTypesEnum.PUT,
  [WriteEndpointTypes.DELETE]: AgnosticEndpointTypesEnum.DELETE,
  [WriteEndpointTypes.DELETE_MANY]: AgnosticEndpointTypesEnum.DELETE,
};
