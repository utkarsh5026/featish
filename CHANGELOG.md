# Changelog

All notable changes to this project will be documented in this file.

## 0.1.0

### Added

- Initial CLI with `featish <name>` command
- Configurable folder structure via `.featishrc.json`, `featish.config.json`, or `.featishrc`
- Barrel `index.ts` file generation with `--no-barrels` opt-out
- Per-feature `README.md` generation with `--no-readme` opt-out
- `--dry-run` mode to preview changes without writing files
- `-d, --dir` option to set target directory
- `--folders` option to override folder list
- `--verbose` flag for config resolution debugging
- `featish init` command to generate starter config
- `featish completion` command for bash/zsh/fish shell completions
- Programmatic API via `featish/api` export
- Kebab-case validation with suggested corrections
