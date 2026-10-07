import { test, expect } from '@playwright/test';

test.describe('Options Navigation, Validation, and Persistence', () => {
  test('should navigate to options, validate inputs, save, and persist after refresh', async ({ page }) => {
    await page.goto('/');
    
    // Click Options in main menu
    await page.getByRole('button', { name: 'Game Options' }).click();
    await expect(page.getByRole('heading', { name: 'Battle Options' })).toBeVisible();

    const sessionTime = page.getByText('60s', { exact: true });
    const spawnInterval = page.getByText('3.0s', { exact: true });
    await expect(sessionTime).toBeVisible();
    await expect(spawnInterval).toBeVisible();

    const decreaseSession = page.getByRole('button', { name: 'Decrease session time by 15s' });
    const increaseSession = page.getByRole('button', { name: 'Increase session time by 15s' });
    const increaseSpawn = page.getByRole('button', { name: 'Increase spawn interval by 0.5s' });

    await expect(decreaseSession).toBeDisabled();
    for (let step = 0; step < 2; step++) await increaseSession.click();
    for (let step = 0; step < 6; step++) await increaseSession.click();
    await expect(page.getByText('180s', { exact: true })).toBeVisible();
    await expect(increaseSession).toBeDisabled();
    for (let step = 0; step < 6; step++) await page.getByRole('button', { name: 'Decrease session time by 15s' }).click();
    for (let step = 0; step < 4; step++) await increaseSpawn.click();
    for (let step = 0; step < 8; step++) await page.getByRole('button', { name: 'Decrease spawn interval by 0.5s' }).click();
    await expect(page.getByText('1.0s', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Decrease spawn interval by 0.5s' })).toBeDisabled();
    for (let step = 0; step < 8; step++) await increaseSpawn.click();
    await expect(page.getByText('90s', { exact: true })).toBeVisible();
    await expect(page.getByText('5.0s', { exact: true })).toBeVisible();

    // Refresh the page
    await page.reload();

    // Verify persistence
    await page.getByRole('button', { name: 'Game Options' }).click();
    await expect(page.getByText('90s', { exact: true })).toBeVisible();
    await expect(page.getByText('5.0s', { exact: true })).toBeVisible();
  });
});

