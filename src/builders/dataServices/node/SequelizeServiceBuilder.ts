import {
  APIData,
  BuildDataServicesPayload,
  EndpointTypesEnum,
  TemplateToBuild,
} from '../../../@types';
import { DataRegistry } from '../../../registries/DataRegistry';
import isEmpty from '../../../utils/utilityFunctions/isEmpty';
import { EndpointNameFactory } from '../../../factories/endpoints/node/EndpointNameFactory';
import { HelperFunctionFactory } from '../../../factories/endpoints/node/HelperFunctionFactory';
import { camelToPascal } from '../../../utils/stringUtils';
import {
  countSequelizeTemplate,
  createManySequelizeTemplate,
  createSequelizeTemplate,
  deleteManySequelizeTemplate,
  deleteSequelizeTemplate,
  findByIdSequelizeTemplate,
  findManySequelizeTemplate,
  updateManySequelizeTemplate,
  updateSequelizeTemplate,
} from '../../../templates/dataServices/node/sequelizeTemplates';
import path from 'path';

const dataRegistry = DataRegistry.getInstance();
export class SequelizeServiceBuilder {
  static build(
    apis: APIData[],
    apiFolders: Record<string, BuildDataServicesPayload>,
    dataServicePath: string,
    typescriptPath: string,
  ): TemplateToBuild[] {
    console.log('apiFolders');
    console.log(apiFolders);

    apis.map((api) => {
      const table = dataRegistry.getTable(api.tableName);
      if (!table) return;

      const enumsToImport = Object.values(api.args)
        .map((arg) => arg.type)
        .filter((argType) => argType.includes('Enum'));

      if (!isEmpty(enumsToImport)) {
        apiFolders[api.folders.parent].enumImports.push(...enumsToImport);
      }

      // only if they have models configged. I.E from express, knex models etc.
      apiFolders[api.folders.parent].modelImports.push(`${table.pascalCase}Model`);

      api.methods.map((method) => {
        let template: string = '';
        const apiName = EndpointNameFactory.getEndpointName(method, api.name);
        const helperFunctionName = HelperFunctionFactory.buildHelperFunctionName(
          method,
          apiName,
        );
        const functionName = EndpointNameFactory.buildApiName(helperFunctionName);

        // this is for future implementation where the user can define what helper functions they want
        // the idea is that they may not always exist
        switch (method) {
          case EndpointTypesEnum.CREATE_MANY:
          case EndpointTypesEnum.UPDATE_MANY:
          case EndpointTypesEnum.DELETE:
          case EndpointTypesEnum.DELETE_MANY:
          case EndpointTypesEnum.CREATE:
          case EndpointTypesEnum.UPDATE:
            apiFolders[api.folders.parent].helperImports.push('runTransaction');
            break;
        }

        const typescriptName = camelToPascal(`${functionName}Args`);
        switch (method) {
          case EndpointTypesEnum.ID:
            apiFolders[api.folders.parent].typeImports.push(api.responseType);
            break;
          case EndpointTypesEnum.UPDATE:
          case EndpointTypesEnum.UPDATE_MANY:
          case EndpointTypesEnum.CREATE:
          case EndpointTypesEnum.CREATE_MANY:
          case EndpointTypesEnum.FIND_MANY:
            apiFolders[api.folders.parent].typeImports.push(typescriptName);
            apiFolders[api.folders.parent].typeImports.push(api.responseType);
        }

        switch (method) {
          case EndpointTypesEnum.FIND_MANY:
          case EndpointTypesEnum.CREATE_MANY:
          case EndpointTypesEnum.CREATE:
          case EndpointTypesEnum.UPDATE_MANY:
          case EndpointTypesEnum.UPDATE:
            apiFolders[api.folders.parent].typesToCreate.push(
              `export type ${typescriptName}= {${Object.values(api.args)
                .map((arg) => arg.argWithType.join(arg.required ? ':' : '?:'))
                .join(';')}}`,
            );
        }

        switch (method) {
          case EndpointTypesEnum.DELETE:
            template = deleteSequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.DELETE_MANY:
            template = deleteManySequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.UPDATE:
            template = updateSequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.UPDATE_MANY:
            template = updateManySequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.CREATE:
            template = createSequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.CREATE_MANY:
            template = createManySequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.FIND_MANY:
            template = findManySequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.COUNT:
            template = countSequelizeTemplate(api, functionName);
            break;
          case EndpointTypesEnum.ID:
            template = findByIdSequelizeTemplate(api, functionName);
            break;
        }

        apiFolders[api.folders.parent].dataServices.push(template);
      });

      const dataServices = Object.keys(apiFolders).map((folder) => ({
        path: path.join(dataServicePath, folder, 'index.ts'),
        template: this.buildTemplate(apiFolders[folder]),
      }));

      const typesToCreate = Object.keys(apiFolders).map((folder) => ({
        path: path.join(typescriptPath, folder, 'index.ts'),
        template: this.buildTypescriptTemplate(apiFolders[folder]),
      }));

      return [
        ...dataServices,
        ...typesToCreate,
        // dataServices root index.ts
        {
          path: `${dataServicePath}/index.ts`,
          template: Object.keys(apiFolders)
            .map((folder) => `export * from './${folder}';`)
            .join('\n'),
        },
        // dataServices root types index.ts
        {
          path: `${typescriptPath}/index.ts`,
          template: Object.keys(apiFolders)
            .map((folder) => `export * from './${folder}';`)
            .join('\n'),
        },
      ];
    });

    const dataServices = Object.keys(apiFolders).map((folder) => ({
      path: path.join(dataServicePath, folder, 'index.ts'),
      template: this.buildTemplate(apiFolders[folder]),
    }));

    const typesToCreate = Object.keys(apiFolders).map((folder) => ({
      path: path.join(typescriptPath, folder, 'index.ts'),
      template: this.buildTypescriptTemplate(apiFolders[folder]),
    }));

    return [
      ...dataServices,
      ...typesToCreate,
      // dataServices root index.ts
      {
        path: `${dataServicePath}/index.ts`,
        template: Object.keys(apiFolders)
          .map((folder) => `export * from './${folder}';`)
          .join('\n'),
      },
      // dataServices root types index.ts
      {
        path: `${typescriptPath}/index.ts`,
        template: Object.keys(apiFolders)
          .map((folder) => `export * from './${folder}';`)
          .join('\n'),
      },
    ];
  }

  private static buildTypescriptTemplate({
    enumImports: eImports,
    typesToCreate,
  }: BuildDataServicesPayload): string {
    const enumImports = () => {
      if (eImports.length > 0) {
        return `import {${[...new Set(eImports)].join(',\n')}} from '../../../../enums';`;
      }
      return '';
    };
    return `
      ${enumImports()}
      
      ${[...new Set(typesToCreate)].join('\n\n')}
    `;
  }

  private static buildTemplate({
    helperImports,
    enumImports: eImports,
    typeImports: tImports,
    dataServices,
    modelImports: mImports,
  }: BuildDataServicesPayload): string {
    const typeImports = () => {
      const uniqueTypeImports = [...new Set(tImports)].filter(Boolean);
      if (uniqueTypeImports.length > 0) {
        return `import {${uniqueTypeImports.join(',\n')}} from '../../@types';`;
      }
      return '';
    };

    const enumImports = () => {
      const uniqueEnums = [...new Set(eImports)].filter(Boolean);
      if (uniqueEnums.length > 0) {
        return `import {${uniqueEnums.join(',\n')}} from '../../../enums';`;
      }
      return '';
    };

    const modelImports = () => {
      const uniqueModels = [...new Set(mImports || [])].filter(Boolean);
      if (uniqueModels.length > 0) {
        return `import {${uniqueModels.join(',\n')}} from '../../models';`;
      }
      return '';
    };

    const utilImports = () => {
      if (helperImports.length > 0) {
        return `import {
          ${[...new Set(helperImports)].join(',\n')}
        } from '../utils';`;
      }
      return '';
    };

    return `
      import { Op } from 'sequelize';
      ${utilImports()}
      ${typeImports()}
      ${enumImports()}
      ${modelImports()}

      ${dataServices.join('\n\n')}
    `;
  }
}
