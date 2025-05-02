import { APIType, ORMEnum, PackageRegistryBase } from '../@types';
import { ConfigRegistry } from '../registries';

export const packageRegistryTemplate = (
  packageRegistryBase: PackageRegistryBase,
) => {
  const configRegistry = ConfigRegistry.getConfigInstance();
  const config = configRegistry.getConfig();

  const {
    scripts: scriptsConfig,
    dependencies: dependenciesConfig,
    devDependencies: devDependenciesConfig,
  } = packageRegistryBase;

  const scripts = {
    ...scriptsConfig.library.general,
    ...scriptsConfig.library[config.project.type],
    ...scriptsConfig.orm[config.orm as ORMEnum],
  };
  const dependencies = {
    ...dependenciesConfig.general,
    ...dependenciesConfig.library.general,
    ...dependenciesConfig.api.type[config.apiType as APIType],
    ...dependenciesConfig.orm.general,
    ...dependenciesConfig.orm[config.orm as ORMEnum],
  };
  const { ts: tsGeneralDevDependencies, ...generalDevDependencies } =
    devDependenciesConfig.general;
  let devDependencies = {
    ...(config.project.type === 'ts'
      ? {
          ...tsGeneralDevDependencies,
          ...generalDevDependencies,
        }
      : generalDevDependencies),
  };

  if (config.project.type === 'ts' && config.apiType === 'graphql') {
    devDependencies = {
      ...devDependencies,
      ...devDependenciesConfig.api.type.graphql.ts,
    };
  }

  if (config.project.type === 'ts' && config.library === 'express') {
    devDependencies = {
      ...devDependencies,
      ...devDependenciesConfig.library.express.ts,
    };
  }

  if (config.project.type === 'ts' && config.orm === 'knex') {
    devDependencies = {
      ...devDependencies,
      ...devDependenciesConfig.orm.knex.ts,
    };
  }
  if (config.project.type === 'ts' && config.orm === 'sequelize') {
    devDependencies = {
      ...devDependencies,
      ...devDependenciesConfig.orm.sequelize.ts,
    };
  }
  if (config.project.type === 'js' && config.orm === 'sequelize') {
    devDependencies = {
      ...devDependencies,
      ...devDependenciesConfig.orm.sequelize.js,
    };
  }

  return `{
    "name": "${config.project.name}",
    "type": "${config.project.type === 'ts' ? 'commonjs' : 'commonjs'}",
    "version": "1.0.0",
    "main": "index.js",
    "author": "",
    "license": "${config.project.license}",
    "scripts": {
      ${Object.entries(scripts)
        .map(([key, value]) => `"${key}": "${value}"`)
        .join(',\n      ')}
    },
    "dependencies": {
      ${Object.entries(dependencies)
        .map(([key, value]) => `"${key}": "${value}"`)
        .join(',\n      ')}
    },
    "devDependencies": {
      ${Object.entries(devDependencies)
        .map(([key, value]) => `"${key}": "${value}"`)
        .join(',\n      ')}
    }
  }
  `;
};
