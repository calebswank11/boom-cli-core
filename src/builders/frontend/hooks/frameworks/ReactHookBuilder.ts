import {
  ClientAPIHookDataRobust,
  ClientLibrary,
  Framework,
  TemplateToBuild,
} from '../../../../@types';
import { ClientApiTemplateBuilder } from '../api/ClientApiTemplateBuilder';

export class ReactHookBuilder {
  private library: ClientLibrary;
  private framework: Framework;

  constructor(library: ClientLibrary, framework: Framework) {
    this.library = library;
    this.framework = framework;
  }

  build(hooks: ClientAPIHookDataRobust[]): TemplateToBuild[] {
    const parentFolders: Record<string, string[]> = {};
    const hookTemplates = hooks.map((hook) => {
      // this is apollo instead of apollo server
      // need to ensure its apollo server

      const template =
        ClientApiTemplateBuilder.hookTemplateBuilder[this.framework][this.library][
          hook.type
        ](hook);

      // create object map for index exports/imports
      if (hook.parentFolder) {
        if (parentFolders[hook.parentFolder])
          parentFolders[hook.parentFolder].push(hook.operationName);
        else parentFolders[hook.parentFolder] = [hook.operationName];
      }

      return {
        path: `${hook.operationName}.ts`,
        folder: hook.parentFolder,
        template,
      };
    });

    const folderNames = Object.keys(parentFolders);

    const folderRootFiles = folderNames.map((folderName) => ({
      path: 'index.ts',
      folder: folderName,
      template: parentFolders[folderName]
        .map((file) => `export * from './${file}'`)
        .join('\n'),
    }));

    return [
      {
        path: 'index.ts',
        template: folderNames
          .map((folderName) => `export * from './${folderName}'`)
          .join('\n'),
      },
      ...folderRootFiles,
      ...hookTemplates,
    ];
  }
}
