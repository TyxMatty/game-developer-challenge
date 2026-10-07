import { test, expect } from '@playwright/test';

test.describe('Ranking and History (TanStack + MSW)', () => {
  test('should verify empty states and then record a match successfully', async ({ page }) => {
    await page.goto('/');

    // Go to Ranking
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByRole('heading', { name: 'Hall of Fame' })).toBeVisible();

    // MSW starts empty
    await expect(page.getByText('No matches recorded yet for this configuration.')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    // Play a quick match and win/lose to record history
    await page.getByRole('button', { name: 'Game Options' }).click();
    await page.getByLabel('Game Session Time (seconds):').fill('60');
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__ !== undefined);

    // End match immediately
    await page.evaluate(() => {
      (window as any).__SIMULATION__.score = 150;
      (window as any).__SIMULATION__.player.health = 0; // Death
    });

    await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Status: Saved to Cloud')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Main Menu' }).click();

    // Check Ranking now has our score
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByText('⭐ player_me (You)')).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    // Check Match History
    await page.getByRole('button', { name: 'Match History' }).click();
    await expect(page.getByText('💀 Defeat')).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
  });
});

