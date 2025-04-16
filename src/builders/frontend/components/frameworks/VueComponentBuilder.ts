import { Framework, TemplateToBuild, UILibrary } from '../../../../@types';
import { UiLibraryTemplateBuilder } from '../uiLibrary/UiLibraryBuilder';

export class VueComponentBuilder {
  private uiLibrary: UILibrary;
  private framework: Framework;

  constructor(framework: Framework, uiLibrary: UILibrary) {
    this.uiLibrary = uiLibrary;
    this.framework = framework;
  }

  build(folder?: string): TemplateToBuild[] {
    // doing it this way instead of universalizing this allows for custom flexibility by library.
    const currentTemplates =
      UiLibraryTemplateBuilder.componentBuilder[this.framework][this.uiLibrary];
    return Object.keys(currentTemplates).map((componentKey) => ({
      folder,
      path: `${componentKey}.vue`,
      template: currentTemplates[componentKey](),
    }));
  }
}
