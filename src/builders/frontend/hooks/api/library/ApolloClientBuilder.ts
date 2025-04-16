import { ClientAPIHookDataRobust } from '../../../../../@types';
import { camelToPascal, camelToSnake } from '../../../../../utils/stringUtils';

export class ApolloClientTemplateBuilder {
  // React
  static buildReactQuery(params: ClientAPIHookDataRobust): string {
    const isLazy = params.isLazy;
    const apolloImport = isLazy ? 'useLazyQuery' : 'useQuery';
    const gqlApiMapName = camelToSnake(params.apiName).toUpperCase();

    const baseConstParams = '{ data, loading, error }';

    const handlerName = isLazy ? `do${camelToPascal(params.apiName)}` : '';

    const constParams = isLazy
      ? `[${handlerName}, ${baseConstParams}]`
      : baseConstParams;

    const args = isLazy ? '' : '{ id }: {id: string}';
    const options = isLazy
      ? ''
      : `{
          variables: { id },
          skip: !id,
        }`;

    return `
      import { ${apolloImport} } from '@apollo/client';
      import { ${gqlApiMapName} } from '../../api';
      
      export const ${params.operationName} = (${args}) => {
        const ${constParams} = ${apolloImport}(${gqlApiMapName}, ${options});
      
        return {
          data: data?.${params.parentFolder}?.${params.apiName},
          ${isLazy ? `fetchHandler: ${handlerName},` : ''}
          loading,
          error,
        };
      };
    `;
  }

  static buildReactMutation(params: ClientAPIHookDataRobust): string {
    const gqlApiMapName = camelToSnake(params.apiName).toUpperCase();

    const handlerName = `do${camelToPascal(params.apiName)}`;

    return `
import { useMutation } from '@apollo/client';
import { ${gqlApiMapName} } from '../../api';

export const ${params.operationName} = () => {
  const [${handlerName}, { data, loading, error }] = useMutation(${gqlApiMapName});

  return {
    mutationHandler: ${handlerName},
    data,
    loading,
    error,
  };
};
    `;
  }

  // SolidJS

  static buildSolidJSQuery(params: ClientAPIHookDataRobust): string {
    return ``;
  }

  static buildSolidJSMutation(params: ClientAPIHookDataRobust): string {
    return ``;
  }

  // Svelte

  static buildSvelteQuery(params: ClientAPIHookDataRobust): string {
    return ``;
  }

  static buildSvelteMutation(params: ClientAPIHookDataRobust): string {
    return ``;
  }

  // Vue

  static buildVueQuery(params: ClientAPIHookDataRobust): string {
    return ``;
  }

  static buildVueMutation(params: ClientAPIHookDataRobust): string {
    return ``;
  }
}
