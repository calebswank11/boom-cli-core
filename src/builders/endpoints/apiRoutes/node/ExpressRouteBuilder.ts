import { RouteBase, TemplateToBuild } from '../../../../@types';
import { EndpointNameFactory } from '../../../../factories/endpoints/node/EndpointNameFactory';
import { EndpointHttpMethodMap } from '../../../../helpers/builderHelpers/routerHelpers';
import { DataRegistry } from '../../../../registries/DataRegistry';
import { capitalizeFirstChar } from '../../../../utils/stringUtils';

export class ExpressRouteBuilder {
  static buildRoutes(dataRegistry: DataRegistry): RouteBase[] {
    const routes: RouteBase[] = [];
    const apiRelationShips = dataRegistry.getAllTableToApiRelationships();

    const folders = Object.keys(apiRelationShips);

    const apisWithFolder = folders
      .map((folder) => {
        const apiNames = apiRelationShips[folder];
        return apiNames.map((apiName) => {
          const api = dataRegistry.getApi(apiName);

          if (!api) return null;

          return {
            folder,
            api,
          };
        });
      })
      .flat()
      .filter((record) => record !== null);

    apisWithFolder.map(({ folder, api }) => {
      api?.methods.map((method) => {
        const apiNameAttrs = EndpointNameFactory.getEndpointName(method, api.name);
        const apiName = EndpointNameFactory.buildApiName(apiNameAttrs);
        routes.push({
          name: api.name,
          args: Object.values(api.args),
          functionName: apiName,
          type: dataRegistry.getTypescriptByName(api.responseType),
          folder,
          endpointType: method,
        });
      });
    });

    return routes;
  }

  static getRoutesByFolder(routes: RouteBase[]): TemplateToBuild[] {
    const folders = [...new Set(routes.map((route) => route.folder))];

    const routeDictionary = routes.reduce<Record<string, RouteBase[]>>(
      (acc, route) => {
        if (acc[route.folder]) {
          acc[route.folder].push(route);
        } else {
          acc[route.folder] = [route];
        }

        return acc;
      },
      {},
    );

    const folderRouters = Object.keys(routeDictionary).map((folder) => {
      const routes = routeDictionary[folder];
      const importsItems = [...new Set(routes.map((route) => route.functionName))];
      const imports = `import { ${importsItems.join(',\n')} } from '../../controllers';`;

      const routesToUse = routes
        .map(
          (route) =>
            `router.${EndpointHttpMethodMap[route.endpointType]}(\`\${basePath}/${route.functionName}\`, middlewareOrchestrator, ${route.functionName});`,
        )
        .join('\n\n');

      return {
        path: `${folder}/index.ts`,
        template: `
          import { Router } from 'express';
          import { middlewareOrchestrator } from '../utils';
          ${imports}

          export function build${capitalizeFirstChar(folder)}Routes(router: Router) {
            const basePath = '/${folder}';

            ${routesToUse}
          }
        `,
      };
    });

    return [
      ...folderRouters,
      {
        path: 'index.ts',
        template: `
          import { Router } from 'express';
          ${folders.map((folder) => `import { build${capitalizeFirstChar(folder)}Routes } from './${folder}';`).join('\n')}

          const router = Router();

          ${folders.map((folder) => `build${capitalizeFirstChar(folder)}Routes(router);`).join('\n\n')}

          export default router;
        `,
      },
    ];
  }
}
