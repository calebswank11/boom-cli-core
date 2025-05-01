import boxen from 'boxen';
import chalk from 'chalk';
import { version } from '../../package.json';
import { ScaffoldingConfig } from '../@types';

const logo = `
   ___   ___ __
  / _ ) / // __)
 / _ < /_/\\__\\
/____/(_)(___/
`;
export const logLogo = (withComplete?: boolean) => {
  console.log(chalk.gray(logo));
  console.log(chalk.blueBright(`BOOM!Scaffold`));
  if (withComplete) {
    console.log(
      chalk.green(`Complete - v${version} at ${new Date().toISOString()}`),
    );
  }
};

export const logBreak = () => {
  console.log(``);
};

export const logFinish = () => {
  console.log('>> Next Steps:');
  console.log(chalk.cyan('>> cd build && yarn && yarn dev'));
};

export const logNotes = (config: ScaffoldingConfig) => {
  console.log(chalk.blueBright(`\n-- Notes --`));
  console.log(chalk.blueBright(`- Name: ${config.project.name}`));
  console.log(chalk.blueBright(`- Date: ${new Date().toISOString()}`));
  console.log(chalk.blueBright(`- API Type: ${config.apiType}`));
  console.log(chalk.blueBright(`- Library: ${config.library}`));
  console.log(chalk.blueBright(`- ORM: ${config.orm}`));
  if (config.apiType === 'graphql') {
    console.log(
      chalk.yellow(
        'If your server errors out on start, check circular dependencies in typedefs. One file importing a typedef that imports another file importing the first file is a circular dependency',
      ),
    );
  }
};

export const logRepoIssuesLink = () => {
  console.log(chalk.grey('https://github.com/calebswank11/boom-cli-core/issues'));
};

export const logSectionHeader = (content: string) => {
  console.log(chalk.blueBright(`\n-- ${content} --`));
};

export const logSectionHeaderError = (content: string) => {
  console.log(chalk.redBright(`\n-- ${content} --`));
};

export function logBSInfo() {
  const title = chalk.bold.blue('BOOM!Scaffold');

  const versionText = chalk.dim(`v${version} — ${new Date().toISOString()}`);

  const cta =
    chalk.gray('⭐ Like this tool? Star it:') +
    chalk.blueBright(' https://github.com/calebswank11/boom-cli-core');

  const bug =
    chalk.gray('🐛 Found a bug? Report at:') +
    chalk.blueBright(' https://github.com/calebswank11/boom-cli-core/issues');

  const box = boxen(`${logo}\n${title}\n${versionText}\n\n${cta}\n${bug}`, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'grey',
  });

  console.log(box);
}
