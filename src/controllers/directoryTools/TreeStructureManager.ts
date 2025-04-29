import path from 'path';
import { ORMEnum, ScaffoldingConfig } from '../../@types';
import { indexTypesTemplate } from '../../templates/@types';
import { commonIndexTypesTemplate } from '../../templates/@types/common';
import { refiningTypesTemplate } from '../../templates/@types/common/refining';
import { helpersTypesTemplate } from '../../templates/@types/tables/helpers';
import { typedefsTypesTemplate } from '../../templates/@types/typedefs';
import { utilsTemplate } from '../../templates/@types/utils';
import { apolloGraphqlSchemaTemplate } from '../../templates/apiRoutes/node/apolloGraphqlSchema';
import { routeUtilsTemplate } from '../../templates/apiRoutes/routeUtilsTemplate';
import { knexDBConfigTemplate } from '../../templates/database/knex/config';
import { knexSingletonDBTemplate } from '../../templates/database/knex/singletonAccess';
import { sequelizeDBConfigTemplate } from '../../templates/database/sequelize/config';
import { sequelizeSingletonDBTemplate } from '../../templates/database/sequelize/singletonAccess';
import { migrationUtilsTemplates } from '../../templates/migrations/utils';
import { seedsUtilsIndexTemplate } from '../../templates/seeds/utils';
import { tsConfigTemplate } from '../../templates/tsConfigTemplate';
import { indexUtilityFunctionsTemplate } from '../../templates/utils/utilityFunctions';
import { deepCloneTemplate } from '../../templates/utils/utilityFunctions/deepClone';
import { getTemplate } from '../../templates/utils/utilityFunctions/get';
import { intersectionTemplate } from '../../templates/utils/utilityFunctions/intersection';
import { isEmptyTemplate } from '../../templates/utils/utilityFunctions/isEmpty';

export class TreeStructureManager {
  private config: ScaffoldingConfig;
  private defaultTemplates = {
    CONFIG: {
      DB: {
        [ORMEnum.knex]: knexDBConfigTemplate,
        [ORMEnum.sequelize]: sequelizeDBConfigTemplate,
        [ORMEnum.prisma]: 'prismaORMTemplate',
        [ORMEnum.typeorm]: 'typeORMTemplate',
      },
      TSCONFIG: tsConfigTemplate,
    },
    DATABASE: {
      CONNECTION: {
        [ORMEnum.knex]: knexSingletonDBTemplate,
        [ORMEnum.sequelize]: sequelizeSingletonDBTemplate,
        [ORMEnum.prisma]: 'prismaORMTemplate',
        [ORMEnum.typeorm]: 'typeORMTemplate',
      },
    },
  };

  constructor(config: ScaffoldingConfig) {
    this.config = config;
  }

  withRoot(folderPath: string, fileName?: string) {
    return path.join(this.config.root, folderPath, fileName || '');
  }

  private getProjectRoot(folder: string) {
    return path.join(process.cwd(), folder);
  }

  withProjectRoot(folder: string) {
    return this.getProjectRoot(folder);
  }

  getTypescriptStructure() {
    return {
      root: this.withRoot(this.config.outputs.types.folder),
      files: {
        root: ['index.ts', indexTypesTemplate],
      },
      tables: {
        root: this.withRoot(`${this.config.outputs.types.folder}/tables`),
        files: {
          root: ['index.ts'],
          ormConfig: ['_knex.d.ts'],
          helpers: ['helpers.ts', helpersTypesTemplate],
        },
      },
      common: {
        root: this.withRoot(`${this.config.outputs.types.folder}/common`),
        files: {
          root: ['index.ts', commonIndexTypesTemplate],
          refining: ['refining.ts', refiningTypesTemplate],
        },
      },
      typedefs: {
        root: this.withRoot(`${this.config.outputs.types.folder}/typedefs`),
        files: {
          root: ['index.ts', typedefsTypesTemplate],
        },
      },
    };
  }

  getUtilStructure() {
    return {
      root: this.withRoot('src/utils/utilityFunctions'),
      files: {
        root: ['index.ts', indexUtilityFunctionsTemplate],
        deepClone: ['deepClone.ts', deepCloneTemplate],
        get: ['get.ts', getTemplate],
        intersection: ['intersection.ts', intersectionTemplate],
        isEmpty: ['isEmpty.ts', isEmptyTemplate],
      },
    };
  }

  /* START APIType SPECIFIC STRUCTURE */
  getMigrationsStructure() {
    return {
      root: this.withRoot(this.config.outputs.api.migrations.folder),
      utils: {
        root: this.withRoot(`${this.config.outputs.api.migrations.folder}/utils`),
        files: {
          root: ['index.ts', migrationUtilsTemplates(this.config.orm)],
        },
      },
    };
  }
  getSeedsStructure() {
    return {
      root: this.withRoot(this.config.outputs.api.seeds.folder),
      utils: {
        root: this.withRoot(`${this.config.outputs.api.seeds.folder}/utils`),
        files: {
          root: ['index.ts', seedsUtilsIndexTemplate(this.config.orm)],
        },
      },
      dev: this.withRoot(`${this.config.outputs.api.seeds.folder}/dev`),
      staging: this.withRoot(`${this.config.outputs.api.seeds.folder}/staging`),
      prod: this.withRoot(`${this.config.outputs.api.seeds.folder}/prod`),
    };
  }
  getAPIStructure() {
    if (this.config.apiType === 'graphql') {
      const fetchSubFolder = '/queries';
      const writeSubFolder = '/mutations';

      return {
        root: this.withRoot(this.config.outputs.api.apis.folder),
        files: {
          root: ['schema.ts', apolloGraphqlSchemaTemplate],
        },
        query: this.withRoot(
          `${this.config.outputs.api.apis.folder}${fetchSubFolder}`,
        ),
        mutation: this.withRoot(
          `${this.config.outputs.api.apis.folder}${writeSubFolder}`,
        ),
      };
    }
    if (this.config.apiType === 'rest') {
      return {
        root: this.withRoot(this.config.outputs.api.apis.folder),
        files: {
          root: ['index.ts', `// Rest Controller Base file`],
        },
      };
    }

    return {};
  }

  getRoutesStructure() {
    if (this.config.apiType === 'rest') {
      return {
        root: this.withRoot(this.config.outputs.api.routes.folder),
        files: {
          root: ['index.ts', `// Rest Routes base file`],
          utils: ['utils.ts', routeUtilsTemplate(this.config.library)],
        },
      };
    }
  }

  getTypedefsStructure() {
    if (this.config.apiType === 'graphql') {
      return {
        root: this.withRoot(this.config.outputs.api.typedefs.folder),
      };
    }
  }

  getModelStructure() {
    if (this.config.apiType === 'rest') {
      return {
        root: this.withRoot(this.config.outputs.api.models.folder),
        files: {
          root: ['index.ts', '// Rest base model file'],
        },
      };
    }
  }

  getHelperFunctionsStructure() {
    return {
      root: this.withRoot(this.config.outputs.api.helperFunctions.folder),
      files: {
        root: ['index.ts'],
        utils: ['utils.ts', utilsTemplate(this.config.orm)],
      },
    };
  }

  getConfigStructure() {
    return {
      root: this.withRoot(this.config.outputs.config.folder),
      files: {
        root: [
          `${this.config.orm}.ts`,
          this.defaultTemplates.CONFIG.DB[this.config.orm as ORMEnum],
        ],
      },
    };
  }

  getDBStructure() {
    // this will be if config.outputs.config.active = true
    // didn't think it was necessary to include it separately since they're so codependent
    return {
      root: this.withRoot(`${this.config.srcRoot}/database`),
      files: {
        connection: [
          'connectToDB.ts',
          this.defaultTemplates.DATABASE.CONNECTION[this.config.orm as ORMEnum],
        ],
      },
    };
  }

  getBaseFiles() {
    const baseFiles: Record<string, any> = {
      tsConfig: [
        this.withRoot(`tsconfig.json`),
        this.defaultTemplates.CONFIG.TSCONFIG,
      ],
    };
    if (this.config.orm) {
      switch (this.config.orm) {
        case ORMEnum.sequelize:
          baseFiles.sequelize = [
            this.withRoot(`sequelize.ts`),
            this.defaultTemplates.CONFIG.DB[this.config.orm as ORMEnum],
          ];
          break;
        case ORMEnum.knex:
          baseFiles.knexfile = [
            this.withRoot(`knexfile.ts`),
            this.defaultTemplates.CONFIG.DB[this.config.orm as ORMEnum],
          ];
          break;
      }
    }

    return baseFiles;
  }

  getBackendStructure() {
    return {
      files: this.getBaseFiles(),
      helperFunctions: this.getHelperFunctionsStructure(),
      migrations: this.getMigrationsStructure(),
      apis: this.getAPIStructure(),
      routes: this.getRoutesStructure(),
      models: this.getModelStructure(),
      typedefs: this.getTypedefsStructure(),
      seeds: this.getSeedsStructure(),
      config: this.getConfigStructure(),
      database: this.getDBStructure(),
    };
  }

  /* END APIType SPECIFIC STRUCTURE */

  getFrontendStructure() {
    const frontendConfig = this.config.outputs.frontEnd;
    return {
      root: this.withRoot('app'),
      objectMap: {
        root: this.withRoot(frontendConfig.apiObjects.folder),
        files: {
          root: ['index.ts', 'rootAPIObjectMapTemplate'],
        },
      },
      hooks: {
        root: this.withRoot(frontendConfig.hooks.folder),
        files: {
          root: ['index.ts', 'rootHookTemplate'],
        },
      },
      store: {
        root: this.withRoot(frontendConfig.stateManagement.folder),
        files: {
          root: ['index.ts', 'rootStoreTemplate'],
        },
      },
      components: {
        root: this.withRoot(frontendConfig.UI_Library.folder),
        files: {
          root: ['index.ts', 'rootComponentTemplate'],
        },
      },
    };
  }

  getCICDStructure() {
    return {
      root: this.withRoot('cicd'),
      files: {
        root: ['index.ts', 'rootCICDTemplate'],
      },
    };
  }

  getCloudOpsStructure() {
    return {
      root: this.withRoot('cloudOps'),
      files: {
        root: ['index.ts', 'rootCloudOpsTemplate'],
      },
    };
  }

  getAdminPortalStructure() {
    return {
      root: this.withRoot('adminPortal'),
      files: {
        root: ['index.ts', 'rootAdminPortalTemplate'],
      },
    };
  }

  getTreeMap() {
    return {
      root: this.withRoot(''),
      enums: this.withRoot(this.config.outputs.enums.folder),
      data: {
        dataRegistry: `${this.config.srcRoot}/data/registryData`,
      },
      types: this.getTypescriptStructure(),
      api: this.getBackendStructure(),
      utils: this.getUtilStructure(),
      frontend: this.getFrontendStructure(),
      cicd: this.getCICDStructure(),
      cloudOps: this.getCloudOpsStructure(),
      adminPortal: this.getAdminPortalStructure(),
    };
  }
}
