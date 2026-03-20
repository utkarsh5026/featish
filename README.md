# Featish

CLI tool to scaffold feature modules with a consistent structure.

Featish creates standardized feature directories with barrel exports, README files, and a customizable folder layout — so every feature in your project follows the same pattern.

## Installation

```bash
npm install -g featish
```

Or use it directly with npx:

```bash
npx featish user-profile
```

## Quick Start

```bash
# Scaffold a new feature
featish user-profile

# Preview without creating files
featish user-profile --dry-run

# Custom folder structure
featish user-profile --folders components,hooks,utils

# Custom target directory
featish user-profile --dir src/modules
```

This creates:

```
src/features/user-profile/
├── components/
│   └── index.ts
├── hooks/
│   └── index.ts
├── services/
│   └── index.ts
├── stores/
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
├── constants/
│   └── index.ts
├── index.ts
└── README.md
```

## CLI Reference

```
Usage: featish [options] <name>

Arguments:
  name               Feature name in kebab-case (e.g., user-profile)

Options:
  -V, --version      Output the version number
  -d, --dir <path>   Target directory relative to cwd (default: "src/features")
  --no-barrels       Skip generating barrel index.ts files
  --no-readme        Skip generating README.md
  --dry-run          Preview what would be created without writing files
  --folders <items>  Comma-separated list of folders to create
  --verbose          Show config resolution details
  -h, --help         Display help for command
```

### Shell Completions

Generate shell completions for your shell:

```bash
# Bash
featish completion >> ~/.bashrc

# Zsh
featish completion >> ~/.zshrc

# Fish
featish completion --fish > ~/.config/fish/completions/featish.fish
```

### Init

Generate a starter config file in your project root:

```bash
featish init
```

This creates a `.featishrc.json` with the default configuration, ready to customize.

## Configuration

Featish looks for configuration in the following files (in order):

1. `featish.config.json`
2. `.featishrc.json`
3. `.featishrc`

CLI flags override config file values, which override defaults.

### Options

| Option    | Type       | Default                                                                  | Description                          |
| --------- | ---------- | ------------------------------------------------------------------------ | ------------------------------------ |
| `dir`     | `string`   | `"src/features"`                                                         | Target directory relative to cwd     |
| `folders` | `string[]` | `["components", "hooks", "services", "stores", "types", "utils", "constants"]` | Folders to create inside each feature |
| `barrels` | `boolean`  | `true`                                                                   | Generate barrel `index.ts` files     |
| `readme`  | `boolean`  | `true`                                                                   | Generate a `README.md` per feature   |

### Example Configs

**React project** (`.featishrc.json`):

```json
{
  "dir": "src/features",
  "folders": ["components", "hooks", "services", "stores", "types", "utils", "constants"],
  "barrels": true,
  "readme": true
}
```

**Vue project**:

```json
{
  "dir": "src/features",
  "folders": ["components", "composables", "services", "stores", "types", "utils"],
  "barrels": true,
  "readme": true
}
```

**Plain TypeScript**:

```json
{
  "dir": "src/modules",
  "folders": ["services", "types", "utils", "constants"],
  "barrels": true,
  "readme": false
}
```

## Programmatic API

Featish exports its core functions for use in other tools:

```ts
import { scaffoldFeature, generateFiles } from 'featish/api';
import { DEFAULT_CONFIG } from 'featish/api';
import type { FeatishConfig, FeatureFile } from 'featish/api';

// Generate file list without writing to disk
const files: FeatureFile[] = generateFiles('user-profile', DEFAULT_CONFIG);

// Scaffold a feature
const created = await scaffoldFeature('user-profile', DEFAULT_CONFIG, process.cwd(), false);
```

## License

MIT
