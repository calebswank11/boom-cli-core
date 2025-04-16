import {
  APIData,
  ClientAPIHookData,
  ClientLibrary,
  ClientMethod,
  Framework,
} from '../@types';
import { EndpointNameFactory } from '../factories/endpoints/node/EndpointNameFactory';
import { ClientFactory } from '../factories/frontend/ClientFactory';
import { camelToPascal } from '../utils/stringUtils';

export class ExtractClientApi {
  static extract(
    apis: APIData[],
    {
      library,
      framework,
    }: {
      library: ClientLibrary;
      framework: Framework;
    },
  ): { [hookName: string]: ClientAPIHookData } {
    const hookData = apis
      .map((api) => {
        // used because we can limit methods per api call down the line instead of mapping all apis to the api.methods folder.
        return api.methods.map((method) => {
          const apiNameBase = EndpointNameFactory.getEndpointName(method, api.name);
          const apiName = EndpointNameFactory.buildApiName(apiNameBase);

          return {
            client: ClientFactory.getClientLibrary(library, framework),
            operationName: `use${camelToPascal(apiName)}`,
            apiName,
            apiRootName: api.name,
            method: ClientFactory.getMethod(method).toUpperCase() as ClientMethod,
            type: ClientFactory.getMethodType(method, library),
            args: Object.keys(api.args),
            typeName: api.responseType,
            hasPagination: method.includes('findMany'),
            isLazy: method.includes('id'),
            errorHandling: ClientFactory.getErrorHandling(method),
          };
        });
      })
      .flat();

    return hookData.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.operationName]: cur,
      }),
      {},
    );
  }
}
