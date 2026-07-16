/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";

const testDir = defineBddConfig({
  features: "tests/features/*.feature",
  outputDir: "tests/.features-gen",
  steps: "tests/steps/*.ts",
});

export default defineConfig({
  outputDir: "tests/test-results",
  testDir,
  workers: 1,
  use: {
    baseURL: process.env.WEB_URL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
