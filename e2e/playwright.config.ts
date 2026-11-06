import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// APP_ENV selects which app the suite targets. Route shapes and visual
// baselines differ between the legacy (hash-routed) and modern apps.
const APP_ENV = process.env.APP_ENV ?? 'legacy';
if (APP_ENV !== 'legacy' && APP_ENV !== 'modern') {
  throw new Error(`APP_ENV must be "legacy" or "modern", got "${APP_ENV}"`);
}

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Baselines live per app so legacy and modern never overwrite each other.
  snapshotPathTemplate: path.join(
    __dirname,
    '__screenshots__',
    APP_ENV,
    '{testFileName}',
    '{arg}{ext}',
  ),
  // The app shares one seeded database, so specs must not run concurrently.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  // No retries: a flaky test is a bug to fix, not a failure to hide.
  retries: 0,
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
