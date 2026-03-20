import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { DEFAULT_CONFIG, type FeatishConfig } from './types.js';

const CONFIG_FILES = ['featish.config.json', '.featishrc.json', '.featishrc'];

export interface ConfigResult {
  config: FeatishConfig;
  source: string | null;
}

export async function loadConfig(cwd: string): Promise<ConfigResult> {
  for (const file of CONFIG_FILES) {
    const filePath = path.join(cwd, file);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<FeatishConfig>;
      return { config: { ...DEFAULT_CONFIG, ...parsed }, source: file };
    } catch {
      continue;
    }
  }

  return { config: DEFAULT_CONFIG, source: null };
}
