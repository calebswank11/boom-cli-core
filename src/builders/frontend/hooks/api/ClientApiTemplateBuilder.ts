import { ClientAPIHookDataRobust } from '../../../../@types';
import { ApolloClientTemplateBuilder, AxiosBuilder } from './library';

type TemplateFunction = (params: ClientAPIHookDataRobust) => string;

const {
  buildReactQuery,
  buildReactMutation,
  buildSolidJSQuery,
  buildSolidJSMutation,
  buildSvelteQuery,
  buildSvelteMutation,
  buildVueQuery,
  buildVueMutation,
} = ApolloClientTemplateBuilder;

const {
  buildAxiosReactGetRequest,
  buildAxiosReactPutRequest,
  buildAxiosReactPostRequest,
  buildAxiosReactDeleteRequest,
  buildAxiosSolidJSGetRequest,
  buildAxiosSolidJSPutRequest,
  buildAxiosSolidJSPostRequest,
  buildAxiosSolidJSDeleteRequest,
  buildAxiosSvelteGetRequest,
  buildAxiosSveltePutRequest,
  buildAxiosSveltePostRequest,
  buildAxiosSvelteDeleteRequest,
  buildAxiosVueGetRequest,
  buildAxiosVuePutRequest,
  buildAxiosVuePostRequest,
  buildAxiosVueDeleteRequest,
} = AxiosBuilder;

export class ClientApiTemplateBuilder {
  static hookTemplateBuilder: {
    [framework: string]: {
      [client: string]: {
        [operation: string]: TemplateFunction;
      };
    };
  } = {
    react: {
      'apollo-client': {
        query: buildReactQuery,
        mutation: buildReactMutation,
      },
      axios: {
        get: buildAxiosReactGetRequest,
        put: buildAxiosReactPutRequest,
        post: buildAxiosReactPostRequest,
        delete: buildAxiosReactDeleteRequest,
      },
    },
    solid: {
      'solid-apollo': {
        query: buildSolidJSQuery,
        mutation: buildSolidJSMutation,
      },
      axios: {
        get: buildAxiosSolidJSGetRequest,
        put: buildAxiosSolidJSPutRequest,
        post: buildAxiosSolidJSPostRequest,
        delete: buildAxiosSolidJSDeleteRequest,
      },
    },
    svelte: {
      'svelte-apollo': {
        query: buildSvelteQuery,
        mutation: buildSvelteMutation,
      },
      axios: {
        get: buildAxiosSvelteGetRequest,
        put: buildAxiosSveltePutRequest,
        post: buildAxiosSveltePostRequest,
        delete: buildAxiosSvelteDeleteRequest,
      },
    },
    vue: {
      'vue-apollo': {
        query: buildVueQuery,
        mutation: buildVueMutation,
      },
      axios: {
        get: buildAxiosVueGetRequest,
        put: buildAxiosVuePutRequest,
        post: buildAxiosVuePostRequest,
        delete: buildAxiosVueDeleteRequest,
      },
    },
  };
}
