import { test, expect } from './fixtures';

test.describe('Opções da partida', () => {
  test('should contain keyboard focus and close with Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Game Options' }).click();
    await expect(page.getByRole('dialog', { name: 'Battle Options' })).toBeVisible();

    const firstControl = page.getByRole('button', { name: 'Increase session time by 15s' });
    const lastControl = page.getByRole('button', { name: 'Back' });
    await expect(firstControl).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(lastControl).toBeFocused();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('Navegação, validação e persistência das opções.', async ({ page }) => {
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
