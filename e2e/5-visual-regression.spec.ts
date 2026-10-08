import { test, expect } from './fixtures';

test.describe('Regressão visual', () => {
  test('main menu baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();
    await page.evaluate(() => Promise.all(Array.from(document.images, image => image.decode().catch(() => undefined))));
    await expect(page).toHaveScreenshot('main-menu.png', { animations: 'disabled', caret: 'hide' });
  });

  test('stable arena baseline', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { ...window.__GAME_TEST_CONFIG__, manualClock: true };
    });
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.enemies.length = 0;
      simulation.projectiles.length = 0;
      simulation.stop();
    });
    await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
    await expect(page).toHaveScreenshot('stable-arena.png', { animations: 'disabled', caret: 'hide' });
  });

  test('Exibição do resultado e sua persistência após refresh.', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.score = 17;
      simulation.player.health = 0;
    });
    await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible();
    await expect(page.getByText(/Recorded in Hall of Fame/)).toBeVisible();
    await expect(page).toHaveScreenshot('result-screen.png', { animations: 'disabled', caret: 'hide' });
  });
});