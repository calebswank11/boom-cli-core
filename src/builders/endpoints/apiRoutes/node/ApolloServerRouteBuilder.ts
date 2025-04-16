import { EndpointTypesEnum, RouteArgBase, RouteBase } from '../../../../@types';
import { DataRegistry } from '../../../../registries/DataRegistry';
import { EndpointNameFactory } from '../../../../factories/endpoints/node/EndpointNameFactory';
import { pascalToCamel } from '../../../../utils/stringUtils';

export class ApolloServerRouteBuilder {
  private static getGraphQLType(arg: RouteArgBase, strict: boolean) {
    const getType = () => {
      if (arg.type.includes('enum')) {
        // enums should be created separately and encompass this.
        return `${arg.name}Type`;
      }

      switch (arg.type) {
        case 'string':
          return 'GraphQLString';
        case 'number':
          return 'GraphQLInt';
        case 'boolean':
          return 'GraphQLBoolean';
        default:
          return 'GraphQLString';
      }
    };
    // NOTE need to discern what is actually required. Presently, just because its required in the db doesnt mean we care on fetches.
    //  Strict denotes required fields being enforced.
    if (arg.required && strict) {
      return `${arg.name}: {type: new GraphQLNonNull(${getType()})}`;
    }
    return `${arg.name}: {type: ${getType()}}`;
  }
  private static resolverObjectTemplate(route: RouteBase): string {
    switch (route.endpointType) {
      case EndpointTypesEnum.DELETE:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          args: {
            id: {type: new GraphQLNonNull(GraphQLInt)},
          },
          type: baseSuccessObjectType,
        }`;
      case EndpointTypesEnum.DELETE_MANY:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          args: {
            ids: {type: new GraphQLNonNull(new GraphQLList(GraphQLInt))},
          },
          type: baseSuccessObjectType,
        }`;
      case EndpointTypesEnum.COUNT:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          type: baseCountObjectType,
        }`;
      case EndpointTypesEnum.FIND_MANY:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          args: {
            ${route.args.map((arg) => this.getGraphQLType(arg, false)).join(',\n')}
          },
          type: new GraphQLList(${pascalToCamel(route.type.name)}ObjectType),
        }`;
      case EndpointTypesEnum.CREATE_MANY:
      case EndpointTypesEnum.UPDATE_MANY:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          args: {
            ${route.args.map((arg) => this.getGraphQLType(arg, true)).join(',\n')}
          },
          type: new GraphQLList(${pascalToCamel(route.type.name)}ObjectType),
        }`;
      default:
        return `${route.functionName}: {
          resolve: ${route.functionName},
          args: {
            ${route.args.map((arg) => this.getGraphQLType(arg, false)).join(',\n')}
          },
          type: ${pascalToCamel(route.type.name)}ObjectType,
        }`;
    }
  }

  private static buildResolverFileTemplate(
    type: 'Mutation' | 'Query',
    folder: string,
    templates: string[],
    typedefsToImport: string[],
    resolversToImport: string[],
  ) {
    return `
      import {
        ${[...new Set(typedefsToImport)].join(',\n')}
      } from '../../../typedefs';
      ${[...new Set(resolversToImport)].map((resolver) => `import {${resolver}} from './${resolver}';`).join('\n')}
      import {
        GraphQLString,
        GraphQLInt,
        GraphQLBoolean,
        GraphQLNonNull,
        GraphQLList
      } from 'graphql/type';
      import { baseCountObjectType, baseSuccessObjectType } from '../../utils';

      export const ${folder}${type}Resolver = {
        ${templates.join(',\n')}
      }
    `;
  }

  static buildRoutes(dataRegistry: DataRegistry): RouteBase[] {
    const apis = dataRegistry.getAllApis();
    return apis
      .map((api) =>
        api.methods.map((method) => {
          const apiNameAttrs = EndpointNameFactory.getEndpointName(method, api.name);
          const apiName = EndpointNameFactory.buildApiName(apiNameAttrs);

          return {
            name: apiName,
            args: Object.values(api.args),
            functionName: apiName,
            type: dataRegistry.getTypescriptByName(api.responseType),
            folder: api.folders.parent,
            endpointType: method,
          };
        }),
      )
      .flat();
  }

  // this _is_ actually used in the Backend Orchestrator
  static getRoutesByFolder(
    routes: RouteBase[],
  ): { filePath: string; template: string }[] {
    const folders = [...new Set(routes.map((route) => route.folder))];
    const buckets = {
      mutation: folders.reduce<Record<string, RouteBase[]>>(
        (acc, cur) => ({
          ...acc,
          [cur]: [],
        }),
        {},
      ),
      query: folders.reduce<Record<string, RouteBase[]>>(
        (acc, cur) => ({
          ...acc,
          [cur]: [],
        }),
        {},
      ),
    };

    routes.map((route) => {
      switch (route.endpointType) {
        case EndpointTypesEnum.DELETE_MANY:
        case EndpointTypesEnum.DELETE:
        case EndpointTypesEnum.CREATE_MANY:
        case EndpointTypesEnum.CREATE:
        case EndpointTypesEnum.UPDATE:
        case EndpointTypesEnum.UPDATE_MANY:
          // push by folder to mutation
          buckets.mutation[route.folder].push(route);
          break;
        case EndpointTypesEnum.FIND_MANY:
        case EndpointTypesEnum.ID:
        case EndpointTypesEnum.COUNT:
          // push by folder to query
          buckets.query[route.folder].push(route);
          break;
      }
    });

    const buildTemplatesByType = (type: 'mutation' | 'query') => {
      return folders.map((folder) => {
        const typedefsToImport: string[] = [];
        const resolversToImport: string[] = [];
        const templates = buckets[type][folder].map((route) => {
          typedefsToImport.push(`${pascalToCamel(route.type.name)}ObjectType`);
          resolversToImport.push(route.functionName);
          return this.resolverObjectTemplate(route);
        });
        return {
          filePath: `${type === 'mutation' ? 'mutations' : 'queries'}/${folder}/index.ts`,
          template: this.buildResolverFileTemplate(
            type === 'mutation' ? 'Mutation' : 'Query',
            folder,
            templates,
            typedefsToImport,
            resolversToImport,
          ),
        };
      });
    };

    const mutationResolvers = buildTemplatesByType('mutation');

    const queryResolvers = buildTemplatesByType('query');

    const rootMutationResolversToImport: string[] = [];
    const rootMutationFolder = folders.map((folder) => {
      const resolverName = `${folder}MutationResolver`;
      rootMutationResolversToImport.push(
        `import {${resolverName}} from './${folder}';`,
      );
      return `
        ${folder}: {
          type: new GraphQLNonNull(
            new GraphQLObjectType<any, any>({
              name: '${resolverName}',
              fields: ${resolverName},
            }),
          ),
          resolve: () => ({}),
        }
      `;
    });
    const rootQueryResolversToImport: string[] = [];
    const rootQueryFolder = folders.map((folder) => {
      const resolverName = `${folder}QueryResolver`;
      rootQueryResolversToImport.push(
        `import {${resolverName}} from './${folder}';`,
      );
      return `
        ${folder}: {
          type: new GraphQLNonNull(
            new GraphQLObjectType<any, any>({
              name: '${resolverName}',
              fields: ${resolverName},
            }),
          ),
          resolve: () => ({}),
        }
      `;
    });

    const rootMutationResolver = {
      filePath: `mutations/index.ts`,
      template: `
        ${rootMutationResolversToImport.join('\n')}
        import { GraphQLNonNull, GraphQLObjectType } from 'graphql/type';
        
        export default {
          ${rootMutationFolder.join(',\n')}
        }
      `,
    };
    const rootQueryResolver = {
      filePath: `queries/index.ts`,
      template: `
        ${rootQueryResolversToImport.join('\n')}
        import { GraphQLNonNull, GraphQLObjectType } from 'graphql/type';
        
        export default {
          ${rootQueryFolder.join(',\n')}
        }
      `,
    };

    return [
      ...mutationResolvers,
      ...queryResolvers,
      rootMutationResolver,
      rootQueryResolver,
      {
        filePath: 'utils.ts',
        template: `
          import { GraphQLBoolean, GraphQLInt, GraphQLObjectType } from 'graphql/type';
          
          export const baseCountObjectType = new GraphQLObjectType({
            name: 'baseCountObjectType',
            fields: {
              count: { type: GraphQLInt },
            },
          });
          export const baseSuccessObjectType = new GraphQLObjectType({
            name: 'baseSuccessObjectType',
            fields: {
              success: { type: GraphQLBoolean },
            },
          }) 
        `,
      },
    ];
  }
}
