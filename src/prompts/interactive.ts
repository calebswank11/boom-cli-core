import inquirer from 'inquirer';
import {
  ApiTypes,
  ApiTypesEnum,
  CLIOptions,
  CLIOptionsRoot,
  Frameworks,
  Libraries,
  LibrariesEnum,
  ORMs,
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
        message: 'Which ORM would you like to use? (knex & Sequelize are supported)',
        choices: ORMs,
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
          return Libraries.filter((lib) =>
            [LibrariesEnum.express, LibrariesEnum.nestjs].includes(
              lib as LibrariesEnum,
            ),
          );
        }
      } else return Libraries;
    };
    const { library } = await inquirer.prompt([
      {
        type: 'list',
        name: CLIOptionsRoot.library,
        message: 'Which API uiLibrary? (Express & Apollo Server are supported)',
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
        message: 'Include Frontend hooks? (React & SolidJS are supported)',
        choices: ['no', ...Frameworks],
      },
    ]);
    answers.frontEnd = frontend;
  }

  return { ...options, ...answers };
}
