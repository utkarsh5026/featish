import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { generateFiles, scaffoldFeature } from "../src/scaffold.js";
import { DEFAULT_CONFIG, type FeatishConfig } from "../src/types.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "featish-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("generateFiles", () => {
  test("generates barrel files for each folder and a root barrel", () => {
    const config: FeatishConfig = {
      dir: "src/features",
      folders: ["components", "hooks"],
      barrels: true,
      readme: false,
    };

    const files = generateFiles("user-profile", config);

    const paths = files.map((f) => f.path);
    expect(paths).toContain("components/index.ts");
    expect(paths).toContain("hooks/index.ts");
    expect(paths).toContain("index.ts");
  });

  test("root barrel re-exports only known public folders", () => {
    const config: FeatishConfig = {
      dir: "src/features",
      folders: ["components", "services", "utils"],
      barrels: true,
      readme: false,
    };

    const files = generateFiles("data-table", config);
    const rootBarrel = files.find((f) => f.path === "index.ts")!;

    expect(rootBarrel.content).toContain("export * from './components';");
    expect(rootBarrel.content).not.toContain("export * from './services';");
    expect(rootBarrel.content).not.toContain("export * from './utils';");
  });

  test("generates README.md with PascalCase title", () => {
    const config: FeatishConfig = {
      dir: "src/features",
      folders: ["components"],
      barrels: false,
      readme: true,
    };

    const files = generateFiles("user-profile", config);
    const readme = files.find((f) => f.path === "README.md")!;

    expect(readme).toBeDefined();
    expect(readme.content).toContain("# UserProfile Feature");
    expect(readme.content).toContain("- `components/`");
  });

  test("generates no files when barrels and readme are disabled", () => {
    const config: FeatishConfig = {
      dir: "src/features",
      folders: ["components"],
      barrels: false,
      readme: false,
    };

    const files = generateFiles("empty-feature", config);
    expect(files).toHaveLength(0);
  });
});

describe("scaffoldFeature", () => {
  const minimalConfig: FeatishConfig = {
    dir: "features",
    folders: ["components", "utils"],
    barrels: true,
    readme: true,
  };

  test("creates directories and files on disk", async () => {
    const created = await scaffoldFeature(
      "my-feature",
      minimalConfig,
      tmpDir,
      false,
    );

    const featureDir = path.join(tmpDir, "features", "my-feature");
    const stat = await fs.stat(featureDir);
    expect(stat.isDirectory()).toBe(true);

    for (const folder of minimalConfig.folders) {
      const folderStat = await fs.stat(path.join(featureDir, folder));
      expect(folderStat.isDirectory()).toBe(true);
    }

    const rootBarrel = await fs.readFile(
      path.join(featureDir, "index.ts"),
      "utf-8",
    );
    expect(rootBarrel).toContain("my-feature");

    const readme = await fs.readFile(
      path.join(featureDir, "README.md"),
      "utf-8",
    );
    expect(readme).toContain("# MyFeature Feature");

    expect(created).toContain("my-feature/");
    expect(created).toContain("my-feature/components/");
    expect(created).toContain("my-feature/utils/");
    expect(created).toContain("my-feature/index.ts");
    expect(created).toContain("my-feature/README.md");
  });

  test("dry-run does not create anything on disk", async () => {
    const created = await scaffoldFeature(
      "ghost-feature",
      minimalConfig,
      tmpDir,
      true,
    );

    expect(created.length).toBeGreaterThan(0);

    const featureDir = path.join(tmpDir, "features", "ghost-feature");
    await expect(fs.access(featureDir)).rejects.toThrow();
  });

  test("throws when feature directory already exists", async () => {
    const featureDir = path.join(tmpDir, "features", "existing");
    await fs.mkdir(featureDir, { recursive: true });

    await expect(
      scaffoldFeature("existing", minimalConfig, tmpDir, false),
    ).rejects.toThrow("Feature 'existing' already exists");
  });
});
