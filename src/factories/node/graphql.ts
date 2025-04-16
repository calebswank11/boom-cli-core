import {ReadEndpointTypes, WriteEndpointTypes} from '../../@types';

export class GraphQLFactory {
  static getResolverType(method: ReadEndpointTypes | WriteEndpointTypes | string): 'Mutation' | 'Query' {
    switch(method) {
      case WriteEndpointTypes.CREATE:
      case WriteEndpointTypes.UPDATE:
      case WriteEndpointTypes.CREATE_MANY:
      case WriteEndpointTypes.UPDATE_MANY:
      case WriteEndpointTypes.DELETE:
      case WriteEndpointTypes.DELETE_MANY:
        return 'Mutation'
      default:
        return 'Query'
    }
  }
  static getFEResolverArgType(type: string): string {
    switch(type) {
      case 'string':
        return 'String';
      case 'number':
        return 'Int'
      case 'boolean':
        return 'Boolean';
      case 'float':
        return 'Float';
      default: return 'UnknownType'
    }
  }
}
