import { defineConfig, devices } from '@playwright/test';

// E2E target: dev server (default), production preview build (E2E_TARGET=preview),
// or an already deployed URL (E2E_BASE_URL=https://...).
const deployedUrl = process.env.E2E_BASE_URL; // Deployed URL for E2E tests
const usePreview = process.env.E2E_TARGET === 'preview'; // Use the preview build for E2E tests
const port = usePreview ? 4173 : 5173; // Port for the local server depending on the target
const baseURL = deployedUrl ?? `http://localhost:${port}`; // Base URL for E2E tests

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI, // DO NOT allow `test.only` on CI, it WILL fail the build if present
  retries: process.env.CI ? 2 : 0, // Retry failed tests on CI
  workers: 1, // Limit the number of parallel workers to avoid conflicts with MSW / local storage
  outputDir: './test-results',
  reporter: [['html', { outputFolder: './test-report', open: 'never' }]], // HTML report for test results, as asked in the challenge instructions
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: deployedUrl
    ? undefined
    : {
        command: usePreview ? 'npm run build && npm run preview -- --port 4173 --strictPort' : 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
