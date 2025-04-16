import {EndpointTypesEnum} from '../../../@types';

export class MethodTypeFactory {
  static buildMethods(){
    // can use config here to allow/disallow methods
    // const registryConfig = RegistryConfig.getInstance()
    // const config = registryConfig.getConfig();
    return Object.values(EndpointTypesEnum).map(method => method)

  }
}
