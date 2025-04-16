import {
  APIAggregateData,
  EndpointTypesEnum,
  ReadEndpointTypes,
  TableStructureBase,
  TypescriptData,
  WriteEndpointTypes,
} from '../../../@types';

export class ImportFactory {
  static buildServiceImports(
    helperFunctions: APIAggregateData['helperFunctions'],
    dataServiceName: string,
  ): string[] {
    if (helperFunctions) {
      return [...Object.keys(helperFunctions), dataServiceName];
    }
    return [dataServiceName];
  }

  static buildEnumImports(tableCols: TableStructureBase['columns']): string[] {
    return [
      ...new Set(
        Object.values(tableCols)
          .map((col) => col.type.enumDictName)
          .flat(),
      ),
    ].filter((val): val is string => Boolean(val));
  }

  static buildTypescriptImports(
    typescript: TypescriptData,
    method: (ReadEndpointTypes & WriteEndpointTypes) | string,
  ): string[] {
    // maybe do by method here.
    switch (method) {
      case EndpointTypesEnum.FIND_MANY:
      case EndpointTypesEnum.ID:
      case EndpointTypesEnum.CREATE_MANY:
      case EndpointTypesEnum.CREATE:
      case EndpointTypesEnum.UPDATE_MANY:
      case EndpointTypesEnum.UPDATE:
        return [typescript.name];
      case EndpointTypesEnum.COUNT:
        return [];
      case EndpointTypesEnum.DELETE_MANY:
      case EndpointTypesEnum.DELETE:
        return [];
      default:
        return [typescript.name];
    }
  }
}
