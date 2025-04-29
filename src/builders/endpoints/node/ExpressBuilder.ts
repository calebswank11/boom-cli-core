import {
  APIAggregateData,
  APIAggregateDictionary,
  EndpointTypesEnum,
  HelperFunction,
  ReadEndpointTypes,
  TemplateToBuild,
  WriteEndpointTypes
} from '../../../@types';
import { ResponseTypeFactory } from '../../../factories/endpoints/node/ResponseTypeFactory';
import { buildImportsTemplate } from '../../../helpers';
import { DataRegistry } from '../../../registries/DataRegistry';
import { snakeToCamel } from '../../../utils/stringUtils';
import nonIntersection from '../../../utils/utilityFunctions/nonIntersection';

export class ExpressBuilder {
  private baseQueryArgs = [{ name: 'limit' }, { name: 'sort' }, { name: 'offset' }];
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

        const templateToBuild = {
          path: `${api.folders.parent}/${record.functionName}.ts`,
          template: `${buildImportsTemplate(record.imports, {
            utilsImports: [],
            enumImports: [],
            typeImports: [],
            serviceImports: [],
          })}
          `,
        };

        switch (method) {
          case EndpointTypesEnum.CREATE_MANY:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildCreateManyLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.UPDATE_MANY:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildUpdateManyLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.UPDATE:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildUpdateLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.CREATE:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildCreateLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.DELETE:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildDeleteLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.DELETE_MANY:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildDeleteManyLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.FIND_MANY:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildFindManyLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.COUNT:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildCountLogicTemplate(record))}`;
            break;
          case EndpointTypesEnum.ID:
          default:
            templateToBuild.template += `${this.buildWrapperFunctionTemplate(method, record)(this.buildIdLogicTemplate(record))}`;
            break;
        }
        templates.push(templateToBuild);
      });
    });

    return templates;
  }

  buildWrapperFunctionTemplate(
    method: ReadEndpointTypes | WriteEndpointTypes | string,
    record: APIAggregateData,
  ): ({ logic, args }: { logic: string; args: string }) => string {
    return ({ logic, args }) => `
      import {Response, Request} from 'express';

      export const ${record.functionName} = async (
        req: Request,
        res: Response<${ResponseTypeFactory.getResponseType(method, record.typescript.name)} | { success: false; message: string }>
      ) => {
        ${args}

        try {
        ${logic}
        } catch(error) {
          console.error('Error: ${method} of ${record.functionName}:', error)
          res.status(500).send({
            success: false,
            message: 'Failed to ${method} ${record.functionName}'
          });
        }
      }
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
              throw new Error('${typescriptValue.name} is required and missing in one of the payloads.')
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

  buildRequiredArgsChecker(
    record: APIAggregateData,
    argsToIgnore?: string[],
  ): string {
    const args = record.args || [];

    const argsToUse = nonIntersection(
      args.filter((arg) => arg.required).map((arg) => arg.name),
      argsToIgnore || [],
    ).filter((arg) => !(argsToIgnore || []).includes(arg));

    if (argsToUse.length === 0) return '';

    return `
      const requiredFields = [${argsToUse.map((arg) => `'${arg}'`).join(', ')}];

      for (const field of requiredFields) {
        if (!args[field]) {
          return res.status(400).send({ success: false, message: \`Missing \${field} param\` });
        }
      }
    `;
  }

  /**
   * Builds the include options for Sequelize queries based on relationships
   */
  buildIncludeOptions(tableName: string): string {
    const dataRegistry = DataRegistry.getInstance();
    const table = dataRegistry.getTable(tableName);

    if (!table || !table.relationships || table.relationships.length === 0) {
      return '[]';
    }

    const includeOptions = table.relationships.map(relationship => {
      const targetModelName = `${relationship.targetTable.charAt(0).toUpperCase() + relationship.targetTable.slice(1)}Model`;

      return `{
        model: ${targetModelName},
        as: '${relationship.navigationPropertySource}',
        required: false
      }`;
    });

    return `[${includeOptions.join(', ')}]`;
  }

  buildCreateManyLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];
    return {
      args: 'const args = req.body;',
      logic: `
      ${this.buildMappedHelperFunctionTemplate(helperFunctions)}

        const record = await ${record.dataService.name}(args);

        res.status(200).json(record);
      `,
    };
  }
  buildUpdateManyLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    const helperFunctions = record.helperFunctions
      ? Object.values(record.helperFunctions)
      : [];

    return {
      args: 'const args = req.body;',
      logic: `
      ${this.buildMappedHelperFunctionTemplate(helperFunctions)}

        const record = await ${record.dataService.name}(args);

        res.status(200).json(record);
      `,
    };
  }
  buildUpdateLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    return {
      args: 'const args = req.body;',
      logic: `
        if(!args.id)
          return res.status(400).send({ success: false, message: 'Missing id param' });

        const record = await ${record.dataService.name}(args);

        res.status(200).json(record);
      `,
    };
  }
  buildCreateLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    return {
      args: 'const args = req.body;',
      logic: `
        ${this.buildRequiredArgsChecker(record, ['id', 'uuid'])}

        const record = await ${record.dataService.name}(args);

        res.status(200).json(record);
      `,
    };
  }
  buildDeleteLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    return {
      args: 'const {id} = req.body;',
      logic: `const deletedRecord = await ${record.dataService.name}(id);

       if(!deletedRecord) {
          return res.status(400).send({ success: false, message: 'failed to delete record' })
        }

        res.status(200).json({
          id,
        });
      `,
    };
  }
  buildDeleteManyLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    return {
      args: 'const {ids} = req.body;',
      logic: `const deletedRecords = await ${record.dataService.name}(ids);

        if(!deletedRecords || deletedRecords.length === 0) {
          return res.status(400).send({ success: false, message: 'failed to delete records' })
        }

        res.status(200).json({
          ids,
        });
      `,
    };
  }
  buildFindManyLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    const includeOptions = this.buildIncludeOptions(record.typescript.tableName);

    return {
      args: 'const {limit = 10, offset = 0, sort = "id", ...filters} = req.query;',
      logic: `
        const records = await ${record.dataService.name}({
          limit: Number(limit),
          offset: Number(offset),
          order: [[sort, 'ASC']],
          where: filters,
          include: ${includeOptions}
        });

        res.status(200).json(records);
      `,
    };
  }
  buildCountLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    return {
      args: 'const {...filters} = req.query;',
      logic: `
        const count = await ${record.dataService.name}(filters);

        res.status(200).json({ count });
      `,
    };
  }
  buildIdLogicTemplate(record: APIAggregateData): {
    logic: string;
    args: string;
  } {
    const includeOptions = this.buildIncludeOptions(record.typescript.tableName);

    return {
      args: 'const {id} = req.params;',
      logic: `
        const record = await ${record.dataService.name}(id, {
          include: ${includeOptions}
        });

        if(!record) {
          return res.status(404).send({ success: false, message: 'Record not found' });
        }

        res.status(200).json(record);
      `,
    };
  }
}
