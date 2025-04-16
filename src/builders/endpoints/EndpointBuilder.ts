import { ConfigRegistry } from '../../registries';
import {
  APIAggregateData,
  APIAggregateDictionary,
  APIData,
  EndpointBase,
  EndpointTypesEnum,
  ReadEndpointTypes,
  TableStructureBase,
  TypescriptData,
  WriteEndpointTypes,
} from '../../@types';
import { ApolloServerBuilder } from './node/ApolloServerBuilder';
import { ExpressBuilder } from './node/ExpressBuilder';
import { NestJSBuilder } from './node/NestJSBuilder';
import { DataRegistry } from '../../registries/DataRegistry';
import { EndpointNameFactory } from '../../factories/endpoints/node/EndpointNameFactory';
import { HelperFunctionFactory } from '../../factories/endpoints/node/HelperFunctionFactory';
import { ImportFactory } from '../../factories/endpoints/node/ImportFactory';
import { ArgumentsFactory } from '../../factories/endpoints/node/ArgumentsFactory';

export class EndpointBuilder extends ConfigRegistry {
  constructor() {
    super();
  }

  aggregateEndpointData(apis: APIData[]) {
    const dataRegistry = DataRegistry.getInstance();
    const aggregateDataByMethod = (
      method: (ReadEndpointTypes & WriteEndpointTypes) | string,
      {
        api,
        table,
        typescript,
      }: {
        api: APIData;
        table: TableStructureBase | null;
        typescript: TypescriptData;
      },
    ): APIAggregateData | null => {
      if (!table) return null;

      const apiNameBase = EndpointNameFactory.getEndpointName(method, api.name);
      const functionName = EndpointNameFactory.buildApiName(apiNameBase);
      const dataServiceNameBase = HelperFunctionFactory.buildHelperFunctionName(
        method,
        apiNameBase,
      );
      const dataServiceName = EndpointNameFactory.buildApiName(dataServiceNameBase);
      // const apiFunctionName =  HelperFunctionFactory.buildHelperFunctionName(method, )
      const requireHelperFunctions =
        EndpointTypesEnum.CREATE_MANY === method ||
        EndpointTypesEnum.CREATE === method ||
        EndpointTypesEnum.UPDATE_MANY === method ||
        EndpointTypesEnum.UPDATE === method;

      const helperFunctions = requireHelperFunctions
        ? HelperFunctionFactory.getHelperFunctions(
            method,
            table.columns,
            typescript.name,
          )
        : null;

      const enums = Object.values(table.columns)
        .map(
          (column) =>
            column.enumValues &&
            column.enumValues.map((enumVal) =>
              dataRegistry.getEnumValueByName(enumVal),
            ),
        )
        .flat();

      const enumDict = enums.reduce((acc, cur) => {
        if (cur != null && cur.enumName) {
          return {
            ...acc,
            [cur.enumName]: cur,
          };
        }
        return acc;
      }, {});

      return {
        imports: {
          enumImports: ImportFactory.buildEnumImports(table.columns),
          typeImports: ImportFactory.buildTypescriptImports(typescript, method),
          serviceImports: ImportFactory.buildServiceImports(
            helperFunctions,
            dataServiceName,
          ),
          utilsImports: requireHelperFunctions ? ['isEmpty'] : [],
        },
        functionName,
        args: dataRegistry.getApiArgumentsByApi(api.name),
        typescript,
        enumData: enumDict,
        dataService: {
          name: dataServiceName,
          args: ArgumentsFactory.getDataServiceInputArgs(method, table.columns),
        },
        helperFunctions,
      };
    };

    const dataForAPIS = apis.map((api) => {
      const typescript = dataRegistry.getTypescriptByName(api.responseType);
      const table = dataRegistry.getTable(api.name);
      return {
        typescript,
        table,
        api,
      };
    });

    // derive very specific data for each api by method.
    return dataForAPIS.reduce<APIAggregateDictionary>(
      (acc, { api, table, typescript }) => {
        return {
          ...acc,
          [api.name]: api.methods.reduce(
            (subAcc, method) => ({
              ...subAcc,
              [method]: aggregateDataByMethod(method, { api, table, typescript }),
            }),
            {},
          ),
        };
      },
      {},
    );
  }

  buildEndpointsTemplate(apis: APIAggregateDictionary): EndpointBase[] | null {
    const config = this.getConfig();
    switch (config.library) {
      case 'apollo-server': {
        const builder = new ApolloServerBuilder();
        return builder.build(apis);
      }
      case 'express': {
        const builder = new ExpressBuilder();
        return builder.build(apis);
      }
      case 'nestjs': {
        const builder = new NestJSBuilder();
        return builder.build(apis);
      }
      default:
        console.error('⚠️ Library not supported; skipping api creation.');
        return null;
    }
  }
}
