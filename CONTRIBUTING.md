# Contributing to Featish

Thanks for your interest in contributing!

## Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/featish.git
cd featish

# Install dependencies
bun install

# Build
bun run build

# Run tests
bun test
```

## Development

```bash
# Watch mode (rebuilds on file changes)
bun run dev

# Run the CLI locally
node dist/index.js <feature-name>
```

## Project Structure

```
src/
├── index.ts      # CLI entry point (Commander.js)
├── scaffold.ts   # Core scaffolding logic
├── config.ts     # Config file loading
├── types.ts      # TypeScript interfaces and defaults
└── api.ts        # Public programmatic API
tests/
├── cli.test.ts       # Integration tests
├── scaffold.test.ts  # Unit tests for scaffolding
└── config.test.ts    # Unit tests for config loading
```

## Making Changes

1. Create a branch from `main`
2. Make your changes
3. Run `bun test` and ensure all tests pass
4. Run `bun run build` to verify the build succeeds
5. Open a pull request

## Guidelines

- Write tests for new features and bug fixes
- Keep commits focused and descriptive
- Follow the existing code style (Prettier handles formatting)
- Feature names must be in kebab-case
