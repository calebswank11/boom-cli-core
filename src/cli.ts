#!/usr/bin/env node
import { Command } from 'commander';
import runBoomCLI from './runner';
import { ApiTypes, CLIOptionsRoot, ORMs } from './@types';
import { logBSInfo } from './utils/logs';

logBSInfo();

const program = new Command();

program
  .name('boom')
  .description('Generate backend/frontend scaffolding with BOOM!Scaffold')
  .version('1.0.2');

program
  .command('init')
  .description('Get ready for the BOOM!')
  .option('-c, --config <path>', 'Path to config file', 'scaffold.config.json')
  .option(
    `--${CLIOptionsRoot.orm} <${CLIOptionsRoot.orm}>`,
    `Choose ORM (${ORMs.join(', ')})`,
  )
  .option(
    `--${CLIOptionsRoot.apiType} <${CLIOptionsRoot.apiType}>`,
    `Choose API type (${ApiTypes.join(', ')})`,
  )
  .option(`--${CLIOptionsRoot.frontend}`, `Generate ${CLIOptionsRoot.frontend}`)
  // add later
  // .option(`--${CLIOptionsKeys.infra}`, 'Generate infrastructure')
  // .option(`--${CLIOptionsKeys.cicd}`, 'Generate CICD')
  .option('--no-interactive', 'Disable prompts (for CI/CD)')
  .action(runBoomCLI);

program.parse();
