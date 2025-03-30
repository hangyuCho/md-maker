#!/usr/bin/env node

import { Command } from 'commander';
import { create } from './commands/create.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('h9-md-maker')
  .description('Interactive markdown template generator')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new markdown file from template')
  .action(async () => {
    try {
      await create();
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse(); 