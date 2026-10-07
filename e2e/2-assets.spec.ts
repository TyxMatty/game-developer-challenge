import { test, expect } from '@playwright/test';

test.describe('Assets Loading and Retries', () => {
  test.use({ serviceWorkers: 'block' });

  test('should show loading, handle asset failure, and allow retry', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/assets/png/default/ships/ship_1.png', route => route.abort('failed'));
    
    await page.getByRole('button', { name: 'Start Battle' }).click();

    await expect(page.getByRole('alert').getByText('Failed to load game assets')).toBeVisible();

    // Now remove the interception and click Retry
    await page.unroute('**/assets/png/default/ships/ship_1.png');
    
    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
  });
});

