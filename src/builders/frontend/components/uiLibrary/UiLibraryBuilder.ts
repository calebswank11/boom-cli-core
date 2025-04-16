import { FrameworksEnum, UILibrariesEnum } from '../../../../@types';
import { tailwindReactTemplates } from '../../../../templates/frontend/uiLibrary/tailwind/react/tailwindReactTemplates';
import {
  tailwindSolidTemplates
} from '../../../../templates/frontend/uiLibrary/tailwind/solid/tailwindSolidComponents';
import { muiReactTemplates } from '../../../../templates/frontend/uiLibrary/mui/react/muiReactTemplates';
import { muiSolidTemplates } from '../../../../templates/frontend/uiLibrary/mui/solid/muiSolidTemplates';

type TemplateFunction = () => string;
export class UiLibraryTemplateBuilder {
  static componentBuilder: {
    [framework: string]: {
      [uiLibrary: string]: {
        [componentName: string]: TemplateFunction
      }
    };
  } = {
    [FrameworksEnum.react]: {
      [UILibrariesEnum.mui]: muiReactTemplates,
      [UILibrariesEnum.chakra]: {},
      [UILibrariesEnum.tailwind]: tailwindReactTemplates,
    },
    [FrameworksEnum.solid]: {
      [UILibrariesEnum.mui]: muiSolidTemplates,
      [UILibrariesEnum.chakra]: {},
      [UILibrariesEnum.tailwind]: tailwindSolidTemplates,
    },
    [FrameworksEnum.svelte]: {
      [UILibrariesEnum.mui]: {},
      [UILibrariesEnum.chakra]: {},
      [UILibrariesEnum.tailwind]: {},
    },
    [FrameworksEnum.vue]: {
      [UILibrariesEnum.mui]: {},
      [UILibrariesEnum.chakra]: {},
      [UILibrariesEnum.tailwind]: {},
    },
  };
}
