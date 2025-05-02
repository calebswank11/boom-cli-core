import { APIAggregateData } from '../../@types';
import { ApiTypesEnum } from '../../@types/constants';
import { TreeStructureManager } from '../../controllers/directoryTools/TreeStructureManager';
import { ConfigRegistry } from '../../registries/ConfigRegistry';
import isEmpty from '../../utils/utilityFunctions/isEmpty';

// Get the configuration registry at the top level
const configRegistry = ConfigRegistry.getConfigInstance();
const config = configRegistry.getConfig();
const isGraphQL = config.apiType === ApiTypesEnum.graphql;
const treeManager = new TreeStructureManager(config);

// Define path levels based on API type
const pathLevel = isGraphQL ? '../../../' : '../../';

export const apiTypeParsers: Record<
  string,
  (colName: string, enumDictName?: string) => string
> = {
  VARCHAR: (colName) => `string`,
  UUID: (colName) => `string`,
  JSONB: (colName) => `string`,
  TIMESTAMP: (colName) => `string`,
  TIME: (colName) => `string`,
  DATE: (colName) => `string`,
  INT: (colName) => `number`,
  FLOAT: (colName) => `number`,
  DECIMAL: (colName) => `number`,
  NUMERIC: (colName) => `number`,
  ENUM: (colName, enumDictName) => `${enumDictName}`,
  BOOLEAN: (colName) => `boolean`,
  TEXT: (colName) => ` string`,
};

export const apiInlineTypeParsers: Record<
  string,
  (colName: string, enumDictName?: string) => string
> = {
  VARCHAR: (colName) => `string`,
  UUID: (colName) => `string`,
  JSONB: (colName) => `string`,
  TIMESTAMP: (colName) => `string`,
  DATE: (colName) => 'string',
  TIME: (colName) => `string`,
  INT: (colName) => `number`,
  FLOAT: (colName) => `number`,
  DECIMAL: (colName) => `number`,
  NUMERIC: (colName) => `number`,
  ENUM: (colName, enumDictName) =>
    `(typeof ${enumDictName})[keyof typeof ${enumDictName}]`,
  BOOLEAN: (colName) => `boolean`,
  TEXT: (colName) => ` string`,
};

export function buildImportsTemplate({
  utilsImports,
  enumImports,
  typeImports,
  serviceImports,
}: APIAggregateData['imports'], {
  utilsImports: additionalUtilsImports,
  enumImports: additionalEnumImports,
  typeImports: additionalTypeImports,
  serviceImports: additionalServiceImports
}: APIAggregateData['imports']): string {
  let importTemplate = '';
  if (!isEmpty(enumImports)) {
    importTemplate += `import {${enumImports.join(', ')}, ${(additionalEnumImports || []).join(', ')}} from '${pathLevel}../enums';`;
  }
  if (!isEmpty(utilsImports)) {
    importTemplate += utilsImports
    .map(
      (utility) =>
        `import ${utility} from '${pathLevel}utils/utilityFunctions/${utility}';`,
    )
    .join('\n');
    if (!isEmpty(additionalUtilsImports)) {
      importTemplate += additionalUtilsImports
      .map(
        (utility) =>
          `import ${utility} from '${pathLevel}utils/utilityFunctions/${utility}';`,
      )
      .join('\n');
    }
  }
  if (!isEmpty(typeImports)) {
    importTemplate += `import {${typeImports.join(', ')}, ${(additionalTypeImports || []).join(', ')}} from '${pathLevel}@types';`;
  }
  if (!isEmpty(serviceImports)) {
    // Get the API structure from the tree manager
    const apiStructure = treeManager.getAPIStructure();

    // Determine the correct import path based on the API type
    const dataServicesPath = isGraphQL ? '../../../dataServices' : '../../dataServices';

    importTemplate += `import {${serviceImports.join(', ')}, ${(additionalServiceImports || []).join(', ')}} from '${dataServicesPath}';`;
  }
  return importTemplate;
}
