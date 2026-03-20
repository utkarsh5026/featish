import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { FeatishConfig, FeatureFile } from './types.js';

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function generateFiles(
  featureName: string,
  config: FeatishConfig
): FeatureFile[] {
  const files: FeatureFile[] = [];

  if (config.barrels) {
    for (const folder of config.folders) {
      files.push({
        path: `${folder}/index.ts`,
        content: `/* Export all ${folder} from ${featureName} feature */\n`,
      });
    }

    const exportFolders = ['components', 'hooks', 'stores', 'types'].filter(
      (f) => config.folders.includes(f)
    );
    const exports = exportFolders
      .map((f) => `export * from './${f}';`)
      .join('\n');

    files.push({
      path: 'index.ts',
      content: `/* Export all public APIs from ${featureName} feature */\n${exports}\n`,
    });
  }

  if (config.readme) {
    const pascalName = toPascalCase(featureName);
    const folderList = config.folders
      .map((f) => `- \`${f}/\``)
      .join('\n');

    files.push({
      path: 'README.md',
      content: `# ${pascalName} Feature\n\n## Overview\nDescription of the ${featureName} feature.\n\n## Structure\n${folderList}\n`,
    });
  }

  return files;
}

export async function scaffoldFeature(
  featureName: string,
  config: FeatishConfig,
  cwd: string,
  dryRun: boolean
): Promise<string[]> {
  const featurePath = path.join(cwd, config.dir, featureName);
  const created: string[] = [];

  try {
    await fs.access(featurePath);
    throw new Error(`Feature '${featureName}' already exists at ${featurePath}`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }

  if (!dryRun) {
    await fs.mkdir(featurePath, { recursive: true });
  }
  created.push(`${featureName}/`);

  for (const folder of config.folders) {
    const folderPath = path.join(featurePath, folder);
    if (!dryRun) {
      await fs.mkdir(folderPath, { recursive: true });
    }
    created.push(`${featureName}/${folder}/`);
  }

  const files = generateFiles(featureName, config);
  for (const file of files) {
    const fullPath = path.join(featurePath, file.path);
    if (!dryRun) {
      await fs.writeFile(fullPath, file.content, 'utf-8');
    }
    created.push(`${featureName}/${file.path}`);
  }

  return created;
}
