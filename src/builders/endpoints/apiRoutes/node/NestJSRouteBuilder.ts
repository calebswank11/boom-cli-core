import { RouteBase } from '../../../../@types';
import { DataRegistry } from '../../../../registries/DataRegistry';

export class NestJSRouteBuilder {
  static buildRoutes(dataRegistry: DataRegistry): RouteBase[] {
    return [];
  }
  static getRoutesByFolder(
    routes: RouteBase[],
  ): { filePath: string; template: string }[] {
    return [];
  }
}
