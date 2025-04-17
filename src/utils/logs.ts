import boxen from 'boxen';
import chalk from 'chalk';

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
    console.log(chalk.green(`Complete - v1.0.1 at ${new Date().toISOString()}`));
  }
};

export const logBreak = () => {
  console.log(``);
};

export const logFinish = () => {
  console.log('>> Next Steps:');
  console.log(chalk.cyan('>> cd build && yarn && yarn dev'));
};

export const logSectionHeader = (content: string) => {
  console.log(chalk.blueBright(`\n-- ${content} --`));
};

export const logSectionHeaderError = (content: string) => {
  console.log(chalk.redBright(`\n-- ${content} --`));
};

export function logBSInfo() {
  const title = chalk.bold.blue('BOOM!Scaffold');

  const versionText = chalk.dim(`v1.0.1 — ${new Date().toISOString()}`);

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
