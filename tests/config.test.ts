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
    const config = await loadConfig(tmpDir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  test("loads featish.config.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "featish.config.json"),
      JSON.stringify({ dir: "lib/modules", barrels: false }),
    );

    const config = await loadConfig(tmpDir);
    expect(config.dir).toBe("lib/modules");
    expect(config.barrels).toBe(false);
    expect(config.readme).toBe(true);
    expect(config.folders).toEqual(DEFAULT_CONFIG.folders);
  });

  test("loads .featishrc.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, ".featishrc.json"),
      JSON.stringify({ folders: ["components", "utils"] }),
    );

    const config = await loadConfig(tmpDir);
    expect(config.folders).toEqual(["components", "utils"]);
    expect(config.dir).toBe(DEFAULT_CONFIG.dir);
  });

  test("loads .featishrc", async () => {
    await fs.writeFile(
      path.join(tmpDir, ".featishrc"),
      JSON.stringify({ readme: false }),
    );

    const config = await loadConfig(tmpDir);
    expect(config.readme).toBe(false);
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

    const config = await loadConfig(tmpDir);
    expect(config.dir).toBe("from-config");
  });
});
