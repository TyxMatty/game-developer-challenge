import { test, expect } from '@playwright/test';

test.describe('Gameplay Mechanics', () => {
  test('should allow playing the game, moving, shooting, and finishing', async ({ page }) => {
    await page.goto('/');

    // Quick match configuration for testing
    await page.getByRole('button', { name: 'Game Options' }).click();
    await page.getByLabel('Game Session Time (seconds):').fill('60'); // Minimum allowed
    await page.getByLabel('Enemy Spawn Time (seconds):').fill('1'); 
    await page.getByRole('button', { name: 'Save Configuration' }).click();

    // Start battle
    await page.getByRole('button', { name: 'Start Battle' }).click();

    // Verify HUD is visible
    const scoreText = page.getByText(/Score:/);
    await expect(scoreText).toBeVisible();

    // Use page.evaluate to access window.__SIMULATION__
    // Wait for simulation to be attached
    await page.waitForFunction(() => (window as any).__SIMULATION__ !== undefined);

    // Initial position
    const initialPos = await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      return { x: sim.player.x, y: sim.player.y };
    });

    // Press W to move forward
    await page.keyboard.press('KeyW');
    await page.waitForTimeout(500); // Wait for movement

    // Check position changed
    const newPos = await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      return { x: sim.player.x, y: sim.player.y };
    });
    expect(newPos.y).toBeLessThan(initialPos.y); // Moving up decreases Y

    // Shoot front
    await page.keyboard.press('Space');
    let projectileCount = await page.evaluate(() => (window as any).__SIMULATION__.projectiles.length);
    expect(projectileCount).toBeGreaterThan(0);

    // Shoot lateral
    await page.keyboard.press('KeyQ');
    projectileCount = await page.evaluate(() => (window as any).__SIMULATION__.projectiles.length);
    expect(projectileCount).toBeGreaterThan(1); // 3 more projectiles added

    // Fast-forward session time to near end
    await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      sim.sessionTime = 2; // 2 seconds left
    });

    // Wait for match to end automatically
    await expect(page.getByRole('heading', { name: 'Time Out' })).toBeVisible({ timeout: 5000 });

    // Verify Result Modal contains score
    await expect(page.getByText(/Final Score:/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Main Menu' })).toBeVisible();

    // Go to Main Menu
    await page.getByRole('button', { name: 'Main Menu' }).click();
    await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();
  });

  test('should pause and resume correctly without skipping time', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();

    await page.waitForFunction(() => (window as any).__SIMULATION__ !== undefined);

    // Pause by clicking the button
    await page.getByRole('button', { name: '⏸ Pause' }).click();
    
    await expect(page.getByRole('heading', { name: 'Game Paused' })).toBeVisible();

    const timeWhilePaused = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);

    await page.waitForTimeout(1000); // wait 1 sec

    const timeAfterWait = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
    
    // Time should not have decreased
    expect(timeAfterWait).toBe(timeWhilePaused);

    // Resume
    await page.getByRole('button', { name: 'Resume' }).click();

    await page.waitForTimeout(1000);
    const timeAfterResume = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
    expect(timeAfterResume).toBeLessThan(timeWhilePaused);
  });
});

