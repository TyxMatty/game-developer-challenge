import { defineConfig, devices } from '@playwright/test';

// E2E target: dev server (default), production preview build (E2E_TARGET=preview),
// or an already deployed URL (E2E_BASE_URL=https://...).
const deployedUrl = process.env.E2E_BASE_URL;
const usePreview = process.env.E2E_TARGET === 'preview';
const port = usePreview ? 4173 : 5173;
const baseURL = deployedUrl ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Avoid conflicts with MSW / local storage
  outputDir: './test-results',
  reporter: [['html', { outputFolder: './playwright-report', open: 'never' }]],
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
