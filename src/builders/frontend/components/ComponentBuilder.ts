import { Framework, FrameworksEnum, UILibrary } from '../../../@types';
import {
  ReactComponentBuilder,
  SolidJSComponentBuilder,
  SvelteComponentBuilder,
  VueComponentBuilder,
} from './frameworks';

export class ComponentBuilder {
  static getBuilder(framework: Framework, uiLibrary: UILibrary) {
    switch(framework) {
      case FrameworksEnum.solid:
        return new SolidJSComponentBuilder(framework, uiLibrary);
      case FrameworksEnum.svelte:
        return new SvelteComponentBuilder(framework, uiLibrary);
      case FrameworksEnum.vue:
        return new VueComponentBuilder(framework, uiLibrary);
      case FrameworksEnum.react:
        return new ReactComponentBuilder(framework, uiLibrary);
    }
  }
}
