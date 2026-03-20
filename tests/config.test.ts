import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { loadConfig } from "../src/config.js";
import { DEFAULT_CONFIG } from "../src/types.js";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "featish-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("loadConfig", () => {
  test("returns DEFAULT_CONFIG when no config file exists", async () => {
    const { config, source } = await loadConfig(tmpDir);
    expect(config).toEqual(DEFAULT_CONFIG);
    expect(source).toBeNull();
  });

  test("loads featish.config.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "featish.config.json"),
      JSON.stringify({ dir: "lib/modules", barrels: false }),
    );

    const { config, source } = await loadConfig(tmpDir);
    expect(config.dir).toBe("lib/modules");
    expect(config.barrels).toBe(false);
    expect(config.readme).toBe(true);
    expect(config.folders).toEqual(DEFAULT_CONFIG.folders);
    expect(source).toBe("featish.config.json");
  });

  test("loads .featishrc.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, ".featishrc.json"),
      JSON.stringify({ folders: ["components", "utils"] }),
    );

    const { config, source } = await loadConfig(tmpDir);
    expect(config.folders).toEqual(["components", "utils"]);
    expect(config.dir).toBe(DEFAULT_CONFIG.dir);
    expect(source).toBe(".featishrc.json");
  });

  test("loads .featishrc", async () => {
    await fs.writeFile(
      path.join(tmpDir, ".featishrc"),
      JSON.stringify({ readme: false }),
    );

    const { config, source } = await loadConfig(tmpDir);
    expect(config.readme).toBe(false);
    expect(source).toBe(".featishrc");
  });

  test("prioritizes featish.config.json over .featishrc.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "featish.config.json"),
      JSON.stringify({ dir: "from-config" }),
    );
    await fs.writeFile(
      path.join(tmpDir, ".featishrc.json"),
      JSON.stringify({ dir: "from-rc" }),
    );

    const { config, source } = await loadConfig(tmpDir);
    expect(config.dir).toBe("from-config");
    expect(source).toBe("featish.config.json");
  });
});
