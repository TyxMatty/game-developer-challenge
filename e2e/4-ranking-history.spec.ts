import { test, expect } from '@playwright/test';

test.describe('Ranking and History (TanStack + MSW)', () => {
  test('should bypass document navigation while keeping API mocks active', async ({ page }) => {
    const navigationWarnings: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'warning' && message.text().includes('GET /')) {
        navigationWarnings.push(message.text());
      }
    });

    await page.goto('/');
    await page.reload();
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();

    await expect(page.getByRole('row', { name: /Edward "Blackbeard" Teach/ })).toBeVisible();
    expect(navigationWarnings).toEqual([]);
  });

  test('should render ranking pages with the matching fixture set', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByRole('row', { name: /Edward "Blackbeard" Teach/ })).toBeVisible();
    await page.getByRole('button', { name: /Next/ }).click();
    await expect(page.getByRole('row', { name: /Mary Read/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /Edward "Blackbeard" Teach/ })).toHaveCount(0);
  });

  test('should return history before a delayed ranking response', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pirate_mock_scenario', 'out_of_order'));
    const responseOrder: string[] = [];
    page.on('response', response => {
      const pathname = new URL(response.url()).pathname;
      if (pathname === '/api/ranking' || pathname === '/api/history') responseOrder.push(pathname);
    });

    await page.goto('/');
    const rankingRequest = page.waitForRequest(request => new URL(request.url()).pathname === '/api/ranking');
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await rankingRequest;
    await page.getByRole('button', { name: 'Back' }).click();

    const historyResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/history');
    await page.getByRole('button', { name: 'Match History' }).click();
    await historyResponse;
    await expect(page.getByText(/No completed battles/)).toBeVisible();
    await expect.poll(() => responseOrder).toEqual(['/api/history', '/api/ranking']);
  });

  test('should fail ranking independently while history remains available', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pirate_mock_scenario', 'error_ranking_only'));
    await page.goto('/');
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByRole('alert')).toContainText('Failed to load rankings');

    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Match History' }).click();
    await expect(page.getByText(/No completed battles/)).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('should fail history independently while ranking remains available', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pirate_mock_scenario', 'error_history_only'));
    await page.goto('/');
    await page.getByRole('button', { name: 'Match History' }).click();
    await expect(page.getByRole('alert')).toContainText('Failed to load match history');

    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByRole('row', { name: /Edward "Blackbeard" Teach/ })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('should return real HTTP 400 and 500 responses from the selected scenarios', async ({ page }) => {
    await page.goto('/');
    const statuses: number[] = [];
    for (const scenario of ['error_400', 'error_500']) {
      await page.evaluate(value => localStorage.setItem('pirate_mock_scenario', value), scenario);
      await page.reload();
      const responsePromise = page.waitForResponse(response => new URL(response.url()).pathname === '/api/ranking');
      await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
      statuses.push((await responsePromise).status());
      await page.getByRole('button', { name: 'Back' }).click();
    }

    expect(statuses).toEqual([400, 500]);
  });

  test('should show ranking fixtures and record a match successfully', async ({ page }) => {
    let rankingRequests = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/ranking')) rankingRequests++;
    });
    await page.goto('/');

    // Go to Ranking
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect(page.getByRole('heading', { name: 'Hall of Fame' })).toBeVisible();

    await expect(page.getByText('Edward "Blackbeard" Teach')).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    await expect.poll(() => rankingRequests).toBeGreaterThan(1);
    await page.getByRole('button', { name: 'Back' }).click();

    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    // End match immediately
    await page.evaluate(() => {
      (window as any).__SIMULATION__.score = 150;
      (window as any).__SIMULATION__.player.health = 0; // Death
    });

    await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Recorded in Hall of Fame/)).toBeVisible({ timeout: 5000 });

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible();
    await expect(page.getByText('150', { exact: true })).toBeVisible();
    await expect(page.getByText(/Recorded in Hall of Fame/)).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Main Menu' }).click();

    // Check Ranking now has our score
    await page.getByRole('button', { name: 'Ranking Hall of Fame' }).click();
    const playerRow = page.getByRole('row', { name: /Captain Player \(You\)/ });
    await expect(playerRow).toBeVisible();
    await expect(playerRow.getByRole('cell', { name: '150' })).toBeVisible();
    await page.getByRole('button', { name: 'Back' }).click();

    // Check Match History
    await page.getByRole('button', { name: 'Match History' }).click();
    await expect(page.getByText('💀 Defeat')).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
  });

  test('should recover a timed-out registration without duplicating it', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pirate_mock_scenario', 'timeout_match_post'));
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => {
      (window as any).__SIMULATION__.player.health = 0;
    });

    await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Could not upload/)).toBeVisible({ timeout: 10000 });
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pirate_pending_matches_queue') || '[]').length)).toBe(1);

    await page.getByRole('button', { name: '📡 MSW DevTools' }).click();
    await page.getByLabel('Select Scenario').selectOption('success');
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByText(/Recorded in Hall of Fame/)).toBeVisible({ timeout: 5000 });

    const savedMatchCount = await page.evaluate(() => {
      const match = JSON.parse(localStorage.getItem('pirate_last_completed_match') || 'null');
      const matches = JSON.parse(localStorage.getItem('pirate_matches_db') || '[]');
      return matches.filter((entry: { id: string }) => entry.id === match?.id).length;
    });
    expect(savedMatchCount).toBe(1);
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pirate_pending_matches_queue') || '[]').length)).toBe(0);
  });

  test('should clear pending records when network state is reset', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('pirate_pending_matches_queue', JSON.stringify([{ id: 'pending-test' }]));
      localStorage.setItem('pirate_mock_scenario', 'network_error');
    });
    await page.getByRole('button', { name: '📡 MSW DevTools' }).click();
    await page.getByRole('button', { name: 'Reset State & Reload' }).click();
    await page.waitForFunction(() => localStorage.getItem('pirate_pending_matches_queue') === null);

    expect(await page.evaluate(() => localStorage.getItem('pirate_mock_scenario'))).toBe('success');
  });
});
