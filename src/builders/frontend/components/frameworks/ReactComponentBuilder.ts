import { Framework, TemplateToBuild, UILibrary } from '../../../../@types';
import { UiLibraryTemplateBuilder } from '../uiLibrary/UiLibraryBuilder';

export class ReactComponentBuilder {
  private framework: Framework;
  private uiLibrary: UILibrary;

  constructor(framework: Framework, uiLibrary: UILibrary) {
    this.framework = framework;
    this.uiLibrary = uiLibrary;
  }

  build(folder?: string): TemplateToBuild[] {
    // doing it this way instead of universalizing this allows for custom flexibility by library.
    const currentTemplates =
      UiLibraryTemplateBuilder.componentBuilder[this.framework][this.uiLibrary];
    return Object.keys(currentTemplates).map((componentKey) => ({
      folder,
      path: `${componentKey}.tsx`,
      template: currentTemplates[componentKey](),
    }));
  }
}
