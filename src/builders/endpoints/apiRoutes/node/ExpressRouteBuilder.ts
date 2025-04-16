import { RouteBase } from '../../../../@types';
import {DataRegistry} from '../../../../registries/DataRegistry';

export class ExpressRouteBuilder {

  static buildRoutes(dataRegistry: DataRegistry): RouteBase[]{
    return [];
  }

  static getRoutesByFolder(
    routes: RouteBase[],
  ): { filePath: string; template: string }[] {
    return [];
  }
}
