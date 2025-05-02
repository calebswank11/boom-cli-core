import { RouteBase, TemplateToBuild } from '../../../../@types';
import { DataRegistry } from '../../../../registries/DataRegistry';

export class NestJSRouteBuilder {
  static buildRoutes(dataRegistry: DataRegistry): RouteBase[] {
    return [];
  }
  static getRoutesByFolder(
    routes: RouteBase[],
  ): TemplateToBuild[] {
    return [];
  }
}
