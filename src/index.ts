import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';

import { loadConfig } from './config.js';
import { scaffoldFeature } from './scaffold.js';
import { DEFAULT_CONFIG } from './types.js';

const KEBAB_CASE = /^[a-z]+(-[a-z]+)*$/;

function toKebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const program = new Command()
  .name('featish')
  .description('Scaffold feature modules with a consistent structure')
  .version('0.1.0')
  .showHelpAfterError(true);

program
  .command('init')
  .description('Generate a starter .featishrc.json in the current directory')
  .action(async () => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, '.featishrc.json');

    try {
      await fs.access(configPath);
      console.error(chalk.red('Error: .featishrc.json already exists in this directory'));
      process.exit(1);
    } catch {
      // File doesn't exist, good to proceed
    }

    await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf-8');
    console.log(chalk.green('✓ Created .featishrc.json'));
    console.log(chalk.cyan('\nCustomize the config and run:'));
    console.log(chalk.white('  featish <feature-name>\n'));
  });

program
  .command('completion')
  .description('Output shell completion script')
  .option('--fish', 'Output fish completion script')
  .action((opts) => {
    if (opts.fish) {
      console.log(`complete -c featish -f
complete -c featish -n '__fish_use_subcommand' -a 'init' -d 'Generate a starter .featishrc.json'
complete -c featish -n '__fish_use_subcommand' -a 'completion' -d 'Output shell completion script'
complete -c featish -l dir -s d -d 'Target directory relative to cwd'
complete -c featish -l no-barrels -d 'Skip generating barrel index.ts files'
complete -c featish -l no-readme -d 'Skip generating README.md'
complete -c featish -l dry-run -d 'Preview what would be created'
complete -c featish -l folders -d 'Comma-separated list of folders'
complete -c featish -l verbose -d 'Show config resolution details'`);
    } else {
      // Bash/Zsh completion
      console.log(`###-begin-featish-completions-###
_featish_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="init completion"
  local flags="--dir --no-barrels --no-readme --dry-run --folders --verbose --version --help"

  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "\${commands} \${flags}" -- "\${cur}") )
  else
    COMPREPLY=( $(compgen -W "\${flags}" -- "\${cur}") )
  fi
}
complete -F _featish_completions featish
###-end-featish-completions-###`);
    }
  });

program
  .argument('<name>', 'Feature name in kebab-case (e.g., user-profile)')
  .option('-d, --dir <path>', 'Target directory relative to cwd', DEFAULT_CONFIG.dir)
  .option('--no-barrels', 'Skip generating barrel index.ts files')
  .option('--no-readme', 'Skip generating README.md')
  .option('--dry-run', 'Preview what would be created without writing files', false)
  .option('--verbose', 'Show config resolution details', false)
  .option(
    '--folders <items>',
    'Comma-separated list of folders to create',
    (val: string) => val.split(',').map((s) => s.trim()),
  )
  .action(async (name: string, opts) => {
    if (!KEBAB_CASE.test(name)) {
      const suggestion = toKebabCase(name);
      let message = `Error: "${name}" is not in kebab-case.`;
      if (suggestion && suggestion !== name) {
        message += ` Did you mean "${suggestion}"?`;
      } else {
        message += ' Use lowercase words separated by hyphens (e.g., user-profile, data-table).';
      }
      console.error(chalk.red(message));
      process.exit(1);
    }

    const cwd = process.cwd();
    const { config: fileConfig, source: configSource } = await loadConfig(cwd);

    const config = {
      ...fileConfig,
      dir: opts.dir ?? fileConfig.dir,
      barrels: opts.barrels ?? fileConfig.barrels,
      readme: opts.readme ?? fileConfig.readme,
      folders: opts.folders ?? fileConfig.folders,
    };

    if (opts.verbose) {
      console.log(chalk.gray('\n[verbose] Config resolution:'));
      if (configSource) {
        console.log(chalk.gray(`  Config file: ${configSource}`));
      } else {
        console.log(chalk.gray('  Config file: none (using defaults)'));
      }
      console.log(chalk.gray(`  dir: ${config.dir}`));
      console.log(chalk.gray(`  folders: ${config.folders.join(', ')}`));
      console.log(chalk.gray(`  barrels: ${config.barrels}`));
      console.log(chalk.gray(`  readme: ${config.readme}`));
    }

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
