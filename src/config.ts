import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { DEFAULT_CONFIG, type FeatishConfig } from './types.js';

const CONFIG_FILES = ['featish.config.json', '.featishrc.json', '.featishrc'];

export async function loadConfig(cwd: string): Promise<FeatishConfig> {
  for (const file of CONFIG_FILES) {
    const filePath = path.join(cwd, file);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<FeatishConfig>;
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      continue;
    }
  }

  return DEFAULT_CONFIG;
}
