import { Command } from 'commander';
import chalk from 'chalk';

import { loadConfig } from './config.js';
import { scaffoldFeature } from './scaffold.js';
import { DEFAULT_CONFIG } from './types.js';

const KEBAB_CASE = /^[a-z]+(-[a-z]+)*$/;

const program = new Command()
  .name('featish')
  .description('Scaffold feature modules with a consistent structure')
  .version('0.1.0')
  .argument('<name>', 'Feature name in kebab-case (e.g., user-profile)')
  .option('-d, --dir <path>', 'Target directory relative to cwd', DEFAULT_CONFIG.dir)
  .option('--no-barrels', 'Skip generating barrel index.ts files')
  .option('--no-readme', 'Skip generating README.md')
  .option('--dry-run', 'Preview what would be created without writing files', false)
  .option(
    '--folders <items>',
    'Comma-separated list of folders to create',
    (val: string) => val.split(',').map((s) => s.trim()),
  )
  .action(async (name: string, opts) => {
    if (!KEBAB_CASE.test(name)) {
      console.error(
        chalk.red('Error: Feature name must be in kebab-case (e.g., user-profile, data-table)')
      );
      process.exit(1);
    }

    const cwd = process.cwd();
    const fileConfig = await loadConfig(cwd);

    const config = {
      ...fileConfig,
      dir: opts.dir ?? fileConfig.dir,
      barrels: opts.barrels ?? fileConfig.barrels,
      readme: opts.readme ?? fileConfig.readme,
      folders: opts.folders ?? fileConfig.folders,
    };

    if (opts.dryRun) {
      console.log(chalk.yellow('\n[dry-run] Would create:\n'));
    } else {
      console.log(chalk.blue(`\nCreating feature: ${name}\n`));
    }

    try {
      const created = await scaffoldFeature(name, config, cwd, opts.dryRun);

      for (const entry of created) {
        const prefix = opts.dryRun ? chalk.yellow('  ~') : chalk.green('  ✓');
        console.log(`${prefix} ${entry}`);
      }

      if (!opts.dryRun) {
        console.log(chalk.green.bold(`\nFeature '${name}' created successfully!\n`));
      }

      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.white(`  cd ${config.dir}/${name}`));
      console.log(chalk.white(`  Start building your components and logic\n`));
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });

program.parse();
