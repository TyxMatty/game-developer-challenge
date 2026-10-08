import { test, expect } from './fixtures';

test.describe('Carregamento de assets', () => {
  test.use({ serviceWorkers: 'block' });

  test('Carregamento dos assets, falhas e nova tentativa.', async ({ page }) => {
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
