import {
  ClientAPIHookDataRobust, ClientLibrary, Framework,
  Library,
  TemplateToBuild,
} from '../../../../@types';

export class SolidJSHookBuilder {
  private library: ClientLibrary;
  private framework: Framework;

  constructor(library: ClientLibrary, framework: Framework) {
    this.library = library;
    this.framework = framework;
  }

  build(hooks: ClientAPIHookDataRobust[]): TemplateToBuild[] {
    const mutationTemplate = `
    // src/apis/user/hooks/useUpdateUser.ts
    import { useMutation } from '@apollo/client';
    import { UPDATE_USER } from '../mutations/updateUser';
    
    export const useUpdateUser = () => {
      const [updateUser, { data, loading, error }] = useMutation(UPDATE_USER);
    
      return {
        updateUser,
        data,
        loading,
        error,
      };
    };
    `;
    return [];
  }
}
