import {
  APIData,
  BuildDataServicesPayload,
  EndpointTypesEnum,
  TemplateToBuild,
} from '../../../@types';
import {
  countKnexTemplate,
  createKnexTemplate,
  createManyKnexTemplate,
  deleteKnexTemplate,
  deleteManyKnexTemplate,
  findByIdKnexTemplate,
  findManyKnexTemplate,
  updateKnexTemplate,
  updateManyKnexTemplate,
} from '../../../templates/dataServices/node/knexTemplates';
import { EndpointNameFactory } from '../../../factories/endpoints/node/EndpointNameFactory';
import isEmpty from '../../../utils/utilityFunctions/isEmpty';
import { camelToPascal } from '../../../utils/stringUtils';
import path from 'path';
import { HelperFunctionFactory } from '../../../factories/endpoints/node/HelperFunctionFactory';

export class KnexServiceBuilder {
  static build(
    apis: APIData[],
    apiFolders: Record<string, BuildDataServicesPayload>,
    dataServicePath: string,
    typescriptPath: string,
  ): TemplateToBuild[] {
    // push enums to import
    apis.map((api) => {
      // push types to import
      // allows for dynamic helper function creation
      const enumsToImport = Object.values(api.args)
        .map((arg) => arg.type)
        .filter((argType) => argType.includes('Enum'));

      if (!isEmpty(enumsToImport)) {
        apiFolders[api.folders.parent].enumImports.push(...enumsToImport);
      }

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
          case EndpointTypesEnum.ID:
          case EndpointTypesEnum.FIND_MANY:
            apiFolders[api.folders.parent].helperImports.push('customWhere');
            break;
          case EndpointTypesEnum.CREATE_MANY:
          case EndpointTypesEnum.UPDATE_MANY:
          case EndpointTypesEnum.DELETE:
          case EndpointTypesEnum.DELETE_MANY:
          case EndpointTypesEnum.CREATE:
          case EndpointTypesEnum.UPDATE:
            apiFolders[api.folders.parent].helperImports.push('runTransaction');
            break;
        }

        // add imports
        // this is for future implementation where the user can define what helper functions they want
        // the idea is that they may not always exist
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
            template = deleteKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.DELETE_MANY:
            template = deleteManyKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.UPDATE:
            template = updateKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.UPDATE_MANY:
            template = updateManyKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.CREATE:
            template = createKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.CREATE_MANY:
            template = createManyKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.FIND_MANY:
            template = findManyKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.COUNT:
            template = countKnexTemplate(api, functionName);
            break;
          case EndpointTypesEnum.ID:
            template = findByIdKnexTemplate(api, functionName);
            break;
        }

        apiFolders[api.folders.parent].dataServices.push(template);
      });
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

    const utilImports = () => {
      if (helperImports.length > 0) {
        return `import {
          ${[...new Set(helperImports)].join(',\n')}
        } from '../utils';`;
      }
      return '';
    };

    return `
      import type {Knex} from 'knex';
      import {getKnex} from '../../database/connectToDB';
      ${utilImports()}
      ${typeImports()}
      ${enumImports()}

      const knex: Knex = getKnex();

      ${dataServices.join('\n\n')}
    `;
  }
}
