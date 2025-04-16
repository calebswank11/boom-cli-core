import { LibrariesEnum, Library } from '../../../@types';
import { ApolloServerRouteBuilder } from '../../../builders/endpoints/apiRoutes/node/ApolloServerRouteBuilder';
import { ExpressRouteBuilder } from '../../../builders/endpoints/apiRoutes/node/ExpressRouteBuilder';
import { NestJSRouteBuilder } from '../../../builders/endpoints/apiRoutes/node/NestJSRouteBuilder';

export class ApiRouteFactory {
  static getRouteFactory(type: Library) {
    switch (type) {
      case LibrariesEnum.apollo_server:
        return ApolloServerRouteBuilder;
      case LibrariesEnum.express:
        return ExpressRouteBuilder;
      case LibrariesEnum.nestjs:
        return NestJSRouteBuilder;
      default:
        console.error('⚠️ Routes not supported in this package.');
    }
  }
}
