import { ClientLibrary, Framework } from '../../../@types';
import {
  ReactHookBuilder,
  SolidJSHookBuilder,
  SvelteHookBuilder,
  VueHookBuilder,
} from './frameworks';

export class HookBuilder {
  static getBuilder(framework: Framework, library: ClientLibrary) {
    // allows support by backend li
    switch (framework) {
      case 'react':
        return new ReactHookBuilder(library, framework);
      case 'solid':
        return new SolidJSHookBuilder(library, framework);
      case 'svelte':
        return new SvelteHookBuilder(library, framework);
      case 'vue':
        return new VueHookBuilder(library, framework);
      default:
        console.error('⚠️ Framework not supported; skipping API Hook creation.');
        return null;
    }
  }
}
