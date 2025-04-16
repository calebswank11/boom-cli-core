import { DataRegistry } from '../../../../registries/DataRegistry';
import { EndpointNameFactory } from '../../../../factories/endpoints/node/EndpointNameFactory';
import { GraphQLFactory } from '../../../../factories/node/graphql';
import { EndpointTypesEnum } from '../../../../@types';

const dataRegistry = DataRegistry.getInstance();

// broke out because prettier does not format gql strings for some reason
const mapTemplate = ({
  constName,
  resolverType,
  endpointName,
  argTypesMap,
  parentFolder,
  argMap,
  responseTypeMap,
}: {
  constName: string;
  resolverType: string;
  endpointName: string;
  argTypesMap: string;
  parentFolder: string;
  argMap: string;
  responseTypeMap: string;
}) => `
import { gql } from '@apollo/client';
            
export const ${constName.replace(/^_+|_+$/g, '')} = gql(\`
  ${resolverType} ${endpointName}(
    ${argTypesMap}
  ){
    ${parentFolder} {
      ${endpointName}(
        ${argMap}
      ) {
        ${responseTypeMap}
      }
    }
  }
\`)
`;

export class GraphQLAPIMapBuilder {
  static build() {
    const apis = dataRegistry.getAllApis();
    const getSpacesX2n = (count: number) => Array(count).fill('  ').join('');

    const folders = Object.values(dataRegistry.getAllApiToTableRelationships());
    const rootResolvers: {
      mutations: Record<string, string[]>;
      queries: Record<string, string[]>;
    } = {
      mutations: folders.reduce<Record<string, string[]>>(
        (acc, cur) => ({
          ...acc,
          [cur]: [],
        }),
        {},
      ),
      queries: folders.reduce<Record<string, string[]>>(
        (acc, cur) => ({
          ...acc,
          [cur]: [],
        }),
        {},
      ),
    };

    const apiMaps = apis
      .map((api) => {
        const typescriptType = dataRegistry.getTypescriptByName(api.responseType);
        return api.methods.map((method) => {
          const apiNameBase = EndpointNameFactory.getEndpointName(method, api.name);
          const constName =
            EndpointNameFactory.buildUpperSnakeCaseApiName(apiNameBase);
          const endpointName = EndpointNameFactory.buildApiName(apiNameBase);
          const resolverTypeBase =
            GraphQLFactory.getResolverType(method).toLowerCase();

          const resolverType =
            resolverTypeBase === 'query' ? 'queries' : 'mutations';

          const argTypesMap = Object.values(api.args)
            .map((arg) => {
              const typescriptValueType = dataRegistry.getTypescriptValueByName(
                api.responseType,
                arg.name,
              );
              const defaultValueType = GraphQLFactory.getFEResolverArgType(arg.type);
              return `$${arg.camelCase}: ${typescriptValueType.graphqlFEType || defaultValueType}${typescriptValueType?.required ? '!' : ''}`;
            })
            .join(`\n${getSpacesX2n(2)}`);

          const argMap = Object.values(api.args)
            .map((arg) => `${arg.name}: $${arg.camelCase}`)
            .join(`\n${getSpacesX2n(4)}`);

          const responseTypeMap = () => {
            if (
              EndpointTypesEnum.DELETE === method ||
              EndpointTypesEnum.DELETE_MANY === method
            ) {
              return 'success';
            }
            if (EndpointTypesEnum.COUNT === method) {
              return 'count';
            }
            // adds defaults as well as removes them if they're included for some reasosn
            return [
              ...new Set([
                'uuid',
                ...Object.values(typescriptType.values).map((value) => value.name),
                'created_at',
                'updated_at',
              ]),
            ].join(`\n${getSpacesX2n(4)}`);
          };

          rootResolvers[resolverType][api.folders.parent].push(
            `export * from './${endpointName}';`,
          );

          return {
            folder: `${resolverType}/${api.folders.parent}`,
            fileName: `${endpointName}.ts`,
            template: mapTemplate({
              constName,
              resolverType: resolverTypeBase,
              endpointName,
              argTypesMap,
              parentFolder: api.folders.parent,
              argMap,
              responseTypeMap: responseTypeMap(),
            }),
          };
        });
      })
      .flat();

    return [
      {
        folder: '',
        fileName: 'index.ts',
        template: `export * from './mutations';\nexport * from './queries';`,
      },
      // queries/mutations index.ts files
      {
        folder: 'queries',
        fileName: 'index.ts',
        template: Object.keys(rootResolvers.queries)
          .map((folder) => `export * from './${folder}'`)
          .join('\n'),
      },
      {
        folder: 'mutations',
        fileName: 'index.ts',
        template: Object.keys(rootResolvers.mutations)
          .map((folder) => `export * from './${folder}'`)
          .join('\n'),
      },
      // folder index.ts files
      ...Object.keys(rootResolvers.mutations).map((folder) => ({
        folder: `mutations/${folder}`,
        fileName: 'index.ts',
        template: rootResolvers.mutations[folder].join('\n'),
      })),
      ...Object.keys(rootResolvers.queries).map((folder) => ({
        folder: `queries/${folder}`,
        fileName: 'index.ts',
        template: rootResolvers.queries[folder].join('\n'),
      })),
      ...apiMaps,
    ];
  }
}
