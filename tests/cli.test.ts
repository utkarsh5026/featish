import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';

let tmpDir: string;

const entryPath = path.resolve(import.meta.dir, '../src/index.ts');

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'featish-cli-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function run(args: string[], cwd?: string) {
  const proc = Bun.spawn(['bun', 'run', entryPath, ...args], {
    cwd: cwd ?? tmpDir,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const exitCode = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();

  return { exitCode, stdout, stderr };
}

describe('CLI integration', () => {
  test('scaffolds a feature with default options', async () => {
    const { exitCode, stdout } = await run(['my-widget']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('my-widget');
    expect(stdout).toContain('created successfully');

    const featureDir = path.join(tmpDir, 'src', 'features', 'my-widget');
    const stat = await fs.stat(featureDir);
    expect(stat.isDirectory()).toBe(true);
  });

  test('rejects non-kebab-case names', async () => {
    const { exitCode, stderr } = await run(['MyWidget']);

    expect(exitCode).toBe(1);
    expect(stderr).toContain('kebab-case');
  });

  test('--dry-run does not create files', async () => {
    const { exitCode, stdout } = await run(['test-feature', '--dry-run']);

    expect(exitCode).toBe(0);
    expect(stdout).toContain('dry-run');

    const featureDir = path.join(tmpDir, 'src', 'features', 'test-feature');
    await expect(fs.access(featureDir)).rejects.toThrow();
  });

  test('--dir overrides the target directory', async () => {
    const { exitCode } = await run(['nav-bar', '--dir', 'lib/modules']);

    expect(exitCode).toBe(0);

    const featureDir = path.join(tmpDir, 'lib', 'modules', 'nav-bar');
    const stat = await fs.stat(featureDir);
    expect(stat.isDirectory()).toBe(true);
  });

  test('--no-barrels skips barrel files', async () => {
    const { exitCode } = await run(['no-barrel-feat', '--no-barrels']);

    expect(exitCode).toBe(0);

    const featureDir = path.join(tmpDir, 'src', 'features', 'no-barrel-feat');
    await expect(
      fs.access(path.join(featureDir, 'index.ts')),
    ).rejects.toThrow();
  });

  test('--no-readme skips README', async () => {
    const { exitCode } = await run(['no-readme-feat', '--no-readme']);

    expect(exitCode).toBe(0);

    const featureDir = path.join(tmpDir, 'src', 'features', 'no-readme-feat');
    await expect(
      fs.access(path.join(featureDir, 'README.md')),
    ).rejects.toThrow();
  });
});
