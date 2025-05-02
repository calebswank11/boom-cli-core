import inquirer from 'inquirer';
import {
  ApiTypes,
  ApiTypesEnum,
  CLIOptions,
  CLIOptionsRoot,
  FrameworksEnum,
  Libraries,
  LibrariesEnum,
  ORMEnum,
} from '../@types';

export async function runInteractivePrompts(
  options: CLIOptions,
): Promise<CLIOptions> {
  const answers: Partial<CLIOptions> = {};

  if (!options.apiType) {
    const { apiType } = await inquirer.prompt([
      {
        type: 'list',
        name: CLIOptionsRoot.apiType,
        message: 'Which API Type?',
        choices: ApiTypes,
      },
    ]);
    answers.apiType = apiType;
  }

  if (!options.orm) {
    const { orm } = await inquirer.prompt([
      {
        type: 'list',
        name: CLIOptionsRoot.orm,
        message: 'Which ORM would you like to use?',
        choices: [ORMEnum.knex, ORMEnum.sequelize],
      },
    ]);
    answers.orm = orm;
  }

  if (!options.library) {
    const choices = () => {
      if (answers.apiType) {
        if (answers.apiType === ApiTypesEnum.graphql) {
          return Libraries.filter((lib) => lib === LibrariesEnum.apollo_server);
        } else {
          return [LibrariesEnum.express];
        }
      } else return Libraries;
    };
    const { library } = await inquirer.prompt([
      {
        type: 'list',
        name: CLIOptionsRoot.library,
        message: 'Which API uiLibrary? ',
        choices: choices(),
      },
    ]);
    answers.library = library;
  }

  if (!options.frontEnd) {
    const { frontend } = await inquirer.prompt([
      {
        type: 'list',
        name: CLIOptionsRoot.frontend,
        message: 'Include Frontend hooks?',
        choices: ['no', FrameworksEnum.react, FrameworksEnum.solid],
      },
    ]);
    answers.frontEnd = frontend;
  }

  return { ...options, ...answers };
}
