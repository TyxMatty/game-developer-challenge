import { test as base, expect } from '@playwright/test';

const GAMEPLAY_SEED = 20261007;

export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript((seed) => {
      window.__GAME_TEST_CONFIG__ = { seed };
    }, GAMEPLAY_SEED);
    await run(page);
  },
});

export { expect };
