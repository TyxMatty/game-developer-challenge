import { test, expect } from '@playwright/test';

test.describe('Options Navigation, Validation, and Persistence', () => {
  test('should navigate to options, validate inputs, save, and persist after refresh', async ({ page }) => {
    await page.goto('/');
    
    // Click Options in main menu
    await page.getByRole('button', { name: 'Game Options' }).click();
    await expect(page.locator('h2', { hasText: 'Settings' })).toBeVisible();

    const sessionTimeInput = page.getByLabel('Game Session Time (seconds):');
    const spawnTimeInput = page.getByLabel('Enemy Spawn Time (seconds):');

    // Default values check
    await expect(sessionTimeInput).toHaveValue('120');
    await expect(spawnTimeInput).toHaveValue('4');

    // Validation checks
    await sessionTimeInput.fill('30');
    await spawnTimeInput.fill('0');
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    // Check validation error
    await expect(page.getByText(/Session time must be between 60 and 180 seconds/)).toBeVisible();
    await expect(page.getByText(/Spawn interval must be positive/)).toBeVisible();

    // Set valid values
    await sessionTimeInput.fill('90');
    await spawnTimeInput.fill('5');
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    // Should return to main menu
    await expect(page.locator('h2', { hasText: 'Settings' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();

    // Refresh the page
    await page.reload();

    // Verify persistence
    await page.getByRole('button', { name: 'Game Options' }).click();
    await expect(sessionTimeInput).toHaveValue('90');
    await expect(spawnTimeInput).toHaveValue('5');
  });
});

