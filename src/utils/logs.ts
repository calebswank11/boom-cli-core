import chalk from 'chalk';

export const logLogo = (withComplete?: boolean) => {
  console.log(
    chalk.gray(`
   ___   ___ __        
  / _ ) / // __)
 / _ < /_/\\__\\
/____/(_)(___/
`),
  );
  console.log(chalk.blueBright(`BOOM!Scaffold`));
  if (withComplete) {
    console.log(chalk.green(`Complete - v0.1.0 at ${new Date().toISOString()}`));
  }
};

export const logBreak = () => {
  console.log(``);
};

export const logFinish = () => {
  console.log(
    chalk.gray(
      '⭐ Like this tool? Drop a star: https://github.com/calebswank11/boom-cli-core',
    ),
  );
  console.log(
    chalk.grey(
      '🐛 Report bugs or suggest features: https://github.com/calebswank11/boom-cli-core',
    ),
  );
  console.log('-------------');
  console.log('>> Next Steps:');
  console.log(chalk.cyan('>> cd build && yarn && yarn dev'));
};

export const logSectionHeader = (content: string) => {
  console.log(chalk.blueBright(`\n-- ${content} --`));
};

export const logSectionHeaderError = (content: string) => {
  console.log(chalk.redBright(`\n-- ${content} --`));
};
