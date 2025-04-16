
import {ReadEndpointTypes, WriteEndpointTypes, APINameBase} from '../../../@types';
import {snakeToCamel} from '../../../utils/stringUtils';

export class EndpointNameFactory {
  static getEndpointName(
    type: ReadEndpointTypes | WriteEndpointTypes | string,
    name: string,
  ): APINameBase {
    switch (type) {
      case ReadEndpointTypes.COUNT:
      case ReadEndpointTypes.FIND_MANY:
      case WriteEndpointTypes.CREATE:
      case WriteEndpointTypes.UPDATE:
      case WriteEndpointTypes.CREATE_MANY:
      case WriteEndpointTypes.UPDATE_MANY:
      case WriteEndpointTypes.DELETE:
      case WriteEndpointTypes.DELETE_MANY:
        return {
          name: name,
          prefix: type,
          suffix: '',
        };
      case ReadEndpointTypes.ID:
      default:
        return {
          name: name,
          prefix: 'get',
          suffix: 'by_id',
        };
    }
  }
  static buildApiName(apiNameAttrs: APINameBase): string{
    return snakeToCamel(
      `${apiNameAttrs.prefix}_${apiNameAttrs.name}_${apiNameAttrs.suffix}`,
    )
  }

  static buildUpperSnakeCaseApiName(apiNameAttrs: APINameBase): string {
    return `${apiNameAttrs.prefix}_${apiNameAttrs.name}_${apiNameAttrs.suffix}`.toUpperCase();
  }
}
