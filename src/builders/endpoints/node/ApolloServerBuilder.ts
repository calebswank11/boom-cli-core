import {
  APIAggregateData,
  APIAggregateDictionary,
  EndpointTypesEnum,
  HelperFunction,
  ReadEndpointTypes,
  TemplateToBuild,
  WriteEndpointTypes,
} from '../../../@types';
import { DataRegistry } from '../../../registries/DataRegistry';
import isEmpty from '../../../utils/utilityFunctions/isEmpty';
import { ArgumentsFactory } from '../../../factories/endpoints/node/ArgumentsFactory';
import { snakeToCamel } from '../../../utils/stringUtils';
import { ResponseTypeFactory } from '../../../factories/endpoints/node/ResponseTypeFactory';

export class ApolloServerBuilder {
  build(apiDict: APIAggregateDictionary): TemplateToBuild[] {
    const dataRegistry = DataRegistry.getInstance();
    const templates: TemplateToBuild[] = [];
    Object.keys(apiDict).map((apiName) => {
      const api = dataRegistry.getApi(apiName);
      if (!api) {
        console.error('API is not found, skipping');
        return;
      }
      Object.keys(apiDict[apiName]).map((method) => {
        const record = apiDict[apiName][method];
        switch (method) {
          case EndpointTypesEnum.CREATE_MANY:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildCreateManyLogicTemplate(record))}
              `,
            });
            break;
          case EndpointTypesEnum.UPDATE_MANY:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildUpdateManyLogicTemplate(record))}
              `,
            });
            break;
          case EndpointTypesEnum.UPDATE:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildUpdateLogicTemplate(record))}
              `,
            });
            break;
          case EndpointTypesEnum.CREATE:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildCreateLogicTemplate(record))}
              `,
            });
            break;
          case EndpointTypesEnum.DELETE:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildDeleteLogicTemplate(record))}
              `,
            });
            break;
          case EndpointTypesEnum.DELETE_MANY:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'mutations',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildDeleteManyLogicTemplate(record))}
              `,
            });
            break;
          case ReadEndpointTypes.FIND_MANY:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'queries',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildFindManyLogicTemplate(record))}
              `,
            });
            break;
          case ReadEndpointTypes.COUNT:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'queries',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildCountLogicTemplate(record))}
              `,
            });
            break;
          case ReadEndpointTypes.ID:
          default:
            templates.push({
              path: `${api.folders.parent}/${record.functionName}.ts`,
              folder: 'queries',
              template: `
                ${this.buildImportsTemplate(record.imports)}
                ${this.buildWrapperFunctionTemplate(
                  method,
                  record,
                )(this.buildIdLogicTemplate(record))}
              `,
            });
            break;
        }
      });
    });
    return templates;
  }

  buildImportsTemplate({
    utilsImports,
    enumImports,
    typeImports,
    serviceImports,
  }: APIAggregateData['imports']): string {
    let importTemplate = '';
    if (!isEmpty(enumImports)) {
      importTemplate += `import {${enumImports.join(', ')}} from '../../../../enums';`;
    }
    if (!isEmpty(utilsImports)) {
      importTemplate += utilsImports
        .map(
          (utility) =>
            `import ${utility} from '../../../utils/utilityFunctions/${utility}';`,
        )
        .join('\n');
    }
    if (!isEmpty(typeImports)) {
      importTemplate += `import {${typeImports.join(', ')}} from '../../../@types';`;
    }
    if (!isEmpty(serviceImports)) {
      importTemplate += `import {${serviceImports.join(', ')}} from '../../../dataServices';`;
    }
    return importTemplate;
  }

  buildWrapperFunctionTemplate(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    record: APIAggregateData,
  ): (logic: string) => string {
    return (logic: string) => `
      export const ${record.functionName} = async (
        ${ArgumentsFactory.getArgsTemplate(method, record.args || [])}
        ): Promise<${ResponseTypeFactory.getResponseType(method, record.typescript.name)} | undefined> => {
        ${logic}
      }
      
      export default ${record.functionName};
    `;
  }

  buildMappedHelperFunctionTemplate(helperFunctions: HelperFunction[]): string {
    const dataRegistry = DataRegistry.getInstance();
    return helperFunctions
      .map(({ functionName, typescriptRefKey, args }) => {
        const constName = `${snakeToCamel(args[0].replace(/_id$/g, ''))}Records`;
        const typescript = dataRegistry.getTypescriptByName(typescriptRefKey);

        const dynamicNullCheck = () => {
          const typescriptValue = typescript.values[args[0]];
          if (typescriptValue && !typescriptValue?.required) {
            return `if(!${typescriptValue.name}){
              throw new Error(\`${typescriptValue.name} is required and missing in one of the payloads.\`)
            }`;
          }
          return '';
        };

        return `
          const ${constName} = await Promise.all(
            args.map(async ({ ${args} }) => {
              ${dynamicNullCheck()}
              const record = await ${functionName}(${args});
              if (record) {
                return record.id;
              }
              throw new Error(\`${constName} not found\`);
            }),
          );
      
          if (!${constName} || isEmpty(${constName})) {
            throw new Error('${constName} not found.');
          }
        `;
      })
      .join('\n');
  }

  buildStaticHelperFunctionTemplate(helperFunctions: HelperFunction[]): string {
    const dataRegistry = DataRegistry.getInstance();
    return helperFunctions
      .map(({ functionName, typescriptRefKey, args }) => {
        const constName = `${snakeToCamel(args[0].replace(/_id$/g, ''))}Record`;
        const typescript = dataRegistry.getTypescriptByName(typescriptRefKey);

        const dynamicNullCheck = () => {
          const typescriptValue = typescript.values[args[0]];
          if (typescriptValue && !typescriptValue?.required) {
            return `if(!${typescriptValue.name}){
            console.error('${typescriptValue.name} is required.');
            return;
          }`;
          }
          return '';
        };

        return `
          ${dynamicNullCheck()}
          const ${constName} = await ${functionName}(${args});
      
          if (!${constName} || isEmpty(${constName})) {
            throw new Error('${constName} not found.');
          }
        `;
      })
      .join('\n');
  }

  buildCreateManyLogicTemplate(record: APIAggregateData): string {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];
    return `
      try {
        ${this.buildMappedHelperFunctionTemplate(helperFunctions)}
        
        return ${record.dataService.name}(${record.dataService.args});
      } catch (error) {
        console.error('There was an error processing the request:', error)
      }
    `;
  }
  buildUpdateManyLogicTemplate(record: APIAggregateData): string {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];
    return `
      try {
        ${this.buildMappedHelperFunctionTemplate(helperFunctions)}
        
        return ${record.dataService.name}(${record.dataService.args});
      } catch (error) {
        console.error('There was an error processing the request:', error)
      }
    `;
  }
  buildUpdateLogicTemplate(record: APIAggregateData): string {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];
    return `
      try {
        ${this.buildStaticHelperFunctionTemplate(helperFunctions)}
        
        return ${record.dataService.name}(${record.dataService.args});
      } catch (error) {
        console.error('There was an error processing the request:', error)
      }
    `;
  }
  buildCreateLogicTemplate(record: APIAggregateData): string {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];
    return `
      try {
        ${this.buildStaticHelperFunctionTemplate(helperFunctions)}
        
        return ${record.dataService.name}(${record.dataService.args});
      } catch (error) {
        console.error('There was an error processing the request:', error)
      }
    `;
  }
  buildDeleteLogicTemplate(record: APIAggregateData): string {
    return `
      try {
        return ${record.dataService.name}(id);
      } catch (error) {
        console.error('There was an error processing the request', error);
      }
    `;
  }
  buildDeleteManyLogicTemplate(record: APIAggregateData): string {
    return `
      try {
        return ${record.dataService.name}(ids);
      } catch (error) {
        console.error('There was an error processing the request', error);
      }
    `;
  }
  buildFindManyLogicTemplate(record: APIAggregateData): string {
    return `
      return ${record.dataService.name}(args);
    `;
  }
  buildCountLogicTemplate(record: APIAggregateData): string {
    return `
      const count = await  ${record.dataService.name}();
      return {count}
    `;
  }
  buildIdLogicTemplate(record: APIAggregateData): string {
    return `
      return ${record.dataService.name}(id);
    `;
  }
}
