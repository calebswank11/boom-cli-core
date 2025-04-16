import {
  ClientAPIHookDataRobust,
  ClientLibrary,
  Framework,
  TemplateToBuild,
} from '../../../../@types';

export class VueHookBuilder {
  private library: ClientLibrary;
  private framework: Framework;

  constructor(library: ClientLibrary, framework: Framework) {
    this.library = library;
    this.framework = framework;
  }

  build(hooks: ClientAPIHookDataRobust[]): TemplateToBuild[] {
    return [];
  }
}
