import {defineConfig} from "@playwright/test";
import {tmpdir} from "node:os";
import {join} from "node:path";
export default defineConfig({testDir: "./browser-tests", workers: 1, timeout: 90000,
  outputDir: join(tmpdir(), "shici-browser-test-" + Date.now()),
  use: {browserName: "chromium", headless: true}, reporter: "list"});
