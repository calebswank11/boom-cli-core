import {
  ClientAPIHookDataRobust, ClientLibrary, Framework,
  TemplateToBuild,
} from '../../../../@types';

export class SvelteHookBuilder {
  private library: ClientLibrary;
  private framework: Framework;

  constructor(library: ClientLibrary, framework: Framework) {
    this.library = library;
    this.framework = framework;
  }

  build(hooks: ClientAPIHookDataRobust[]): TemplateToBuild[] {
    const template = `
    // src/apis/user/hooks/useGetUser.ts
    import { useQuery } from '@apollo/client';
    import { GET_USER } from '../queries/getUser';
    
    export const useGetUser = (id: string) => {
      const { data, loading, error } = useQuery(GET_USER, {
        variables: { id },
        skip: !id,
      });
    
      return {
        user: data?.user,
        loading,
        error,
      };
    };
    `;
    return [];
  }
}
