import { test, expect } from '@playwright/test';

test.describe('Assets Loading and Retries', () => {
  test('should show loading, handle asset failure, and allow retry', async ({ page }) => {
    await page.goto('/');
    
    // Intercept one of the texture requests and abort it to simulate failure
    await page.route('**/spritesheet/ship_parts.png', route => route.abort('failed'));
    
    await page.getByRole('button', { name: 'Start Battle' }).click();

    // It should show Loading status briefly
    await expect(page.getByText(/Loading assets.../)).toBeVisible();

    // Then it should fail
    await expect(page.getByText(/Failed to load game assets/)).toBeVisible();

    // Now remove the interception and click Retry
    await page.unroute('**/spritesheet/ship_parts.png');
    
    await page.getByRole('button', { name: 'Retry' }).click();

    // Should load successfully and show the HUD
    await expect(page.getByText(/Score:/)).toBeVisible();
    await expect(page.getByText(/Time:/)).toBeVisible();
  });
});

