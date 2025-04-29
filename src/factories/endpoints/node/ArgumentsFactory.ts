import {
  APIAggregateData,
  APIArgument,
  EndpointTypesEnum,
  ReadEndpointTypes,
  TableStructureBase,
  WriteEndpointTypes,
} from '../../../@types';
import {
  camelToPascal,
  snakeToCamel,
  snakeToCapSentence,
  snakeToPascalCase,
} from '../../../utils/stringUtils';

const buildKeyValPair = (arg: APIArgument) =>
  arg.argWithType.join(arg.required ? ':' : '?:');

export class ArgumentsFactory {
  static getArgumentsData(
    type: ReadEndpointTypes | WriteEndpointTypes | string,
    args: APIArgument[],
  ): APIArgument[] {
    switch (type) {
      case EndpointTypesEnum.COUNT:
        return [];
      case EndpointTypesEnum.UPDATE_MANY:
      case EndpointTypesEnum.UPDATE:
      case EndpointTypesEnum.CREATE_MANY:
      case EndpointTypesEnum.CREATE:
      case EndpointTypesEnum.FIND_MANY:
        return args;
      //   return `${type}${snakeToPascalCase(name)}`;
      case EndpointTypesEnum.ID:
        return [
          {
            name: type,
            pascalCase: snakeToPascalCase(type),
            camelCase: snakeToCamel(type),
            capSentenceCase: snakeToCapSentence(type),
            helperFunctionNameBase: snakeToCamel(type.replace(/_id$/g, '')),
            argWithType: [type, 'string'],
            type: 'string',
            required: true,
          },
        ];
      case EndpointTypesEnum.DELETE:
        return [
          {
            name: 'id',
            pascalCase: 'ID',
            camelCase: 'id',
            capSentenceCase: 'id',
            helperFunctionNameBase: 'id',
            argWithType: ['id', 'string'],
            type: 'string',
            required: true,
          },
        ];
      case EndpointTypesEnum.DELETE_MANY:
        return [
          {
            name: 'ids',
            pascalCase: 'IDS',
            camelCase: 'ids',
            capSentenceCase: 'ids',
            helperFunctionNameBase: 'ids',
            argWithType: ['ids', 'string[]'],
            type: 'string[]',
            required: true,
          },
        ];
      default:
        return [
          ...args,
          {
            name: type,
            pascalCase: snakeToPascalCase(type),
            camelCase: snakeToCamel(type),
            capSentenceCase: snakeToCapSentence(type),
            helperFunctionNameBase: type.replace(/_id$/g, ''),
            argWithType: ['id', 'string'],
            type: 'string',
            required: true,
          },
        ];
    }
  }
  static getNestJSReadArguments(
    type: ReadEndpointTypes | string,
    args: APIArgument[],
  ): APIArgument[] {
    return [];
  }

  static getArgsTemplate(
    type: ReadEndpointTypes | WriteEndpointTypes | string,
    record: APIAggregateData,
  ): string {
    const args = record.args || [];
    if (args.length === 0) return 'args: any';
    switch (type) {
      case EndpointTypesEnum.CREATE_MANY:
      case ReadEndpointTypes.FIND_MANY:
        return `args: ${camelToPascal(record.functionName + 'Args')}[]`;
      case EndpointTypesEnum.UPDATE_MANY:
        return `args: ${camelToPascal(record.functionName + 'Args')}[]`;
      case ReadEndpointTypes.COUNT:
        return 'args: null';
      case EndpointTypesEnum.UPDATE:
      case EndpointTypesEnum.CREATE:
        return `{${args.map((arg) => arg.name).join(',\n')}}: ${camelToPascal(record.functionName + 'Args')}`;
      case EndpointTypesEnum.DELETE:
      case ReadEndpointTypes.ID:
        return `{id}: {id: string;}`;
      case EndpointTypesEnum.DELETE_MANY:
        return `{ids}: {ids: string[];}`;
      default:
        return 'args: any';
    }
  }

  static getDataServiceInputArgs(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    columns: TableStructureBase['columns'],
  ): APIAggregateData['dataService']['args'] {
    const columnVals = Object.values(columns);
    switch (method) {
      case EndpointTypesEnum.CREATE_MANY:
      case ReadEndpointTypes.FIND_MANY:
      case EndpointTypesEnum.UPDATE_MANY:
        return `args`;
      case ReadEndpointTypes.COUNT:
        return null;
      case EndpointTypesEnum.UPDATE:
      case EndpointTypesEnum.CREATE:
        return `{${columnVals.map((arg) => arg.name)}}`;
      case EndpointTypesEnum.DELETE:
      case ReadEndpointTypes.ID:
        return `id`;
      case EndpointTypesEnum.DELETE_MANY:
        return `ids`;
      default:
        return 'args';
    }
  }
}
