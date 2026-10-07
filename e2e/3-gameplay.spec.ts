import { test, expect } from '@playwright/test';

test.describe('Gameplay Mechanics', () => {
  test('should award one point for each enemy destroyed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      const enemy = {
        id: 999,
        type: 'chaser',
        x: simulation.player.x + 60,
        y: simulation.player.y,
        rotation: 0,
        health: 1,
        speed: 0,
        cooldown: 0,
      };
      simulation.enemies.push(enemy);
      simulation.projectiles.push({
        id: 999,
        x: enemy.x - 20,
        y: enemy.y,
        rotation: Math.PI / 2,
        speed: 400,
        life: 2,
        owner: 'player',
      });
    });

    await page.waitForFunction(() => (window as any).__SIMULATION__?.score === 1);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => (window as any).__SIMULATION__.score)).toBe(1);
  });

  test('should report timeout as the termination reason when the timer expires with a score', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.score = 1;
      simulation.sessionTime = 0.05;
    });

    await expect(page.getByRole('heading', { name: 'Time Expired!' })).toBeVisible({ timeout: 5000 });
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pirate_last_completed_match') || 'null')?.reason)).toBe('time_out');
  });

  test('should allow playing the game, moving, shooting, and finishing', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Start Battle' }).click();
    await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    // Initial position
    const initialPos = await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      return { x: sim.player.x, y: sim.player.y };
    });

    // Press W to move forward
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(500); // Wait for movement
    await page.keyboard.up('KeyW');

    // Check position changed
    const newPos = await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      return { x: sim.player.x, y: sim.player.y };
    });
    expect(newPos.y).toBeLessThan(initialPos.y); // Moving up decreases Y

    // Shoot front
    await page.keyboard.down('Space');
    await page.waitForFunction(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'player'));
    await page.keyboard.up('Space');

    const projectileCount = await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length);
    await page.keyboard.down('KeyQ');
    await page.waitForFunction((initialCount) => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length >= initialCount + 3, projectileCount);
    await page.keyboard.up('KeyQ');

    // Fast-forward session time to near end
    await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      sim.sessionTime = 0.1;
    });

    // Wait for match to end automatically
    await expect(page.getByRole('heading', { name: 'Time Expired!' })).toBeVisible({ timeout: 5000 });

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
    await page.getByRole('button', { name: 'Pause game (or press Escape)' }).click();
    
    await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();

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

  test('should auto-pause on focus loss and resume only after an action', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('heading', { name: 'Game Paused' })).toBeVisible();

    const pausedTime = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).__SIMULATION__.sessionTime)).toBe(pausedTime);

    await page.getByRole('button', { name: /Resume/ }).click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__SIMULATION__.sessionTime)).toBeLessThan(pausedTime);
  });

  test('should move from mobile touch controls', async ({ page }) => {
    if ((page.viewportSize()?.width ?? 1280) > 500) test.skip();

    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    const initialY = await page.evaluate(() => (window as any).__SIMULATION__.player.y);
    const forwardButton = page.getByRole('button', { name: 'Thrust Forward' });
    await forwardButton.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch' });
    await page.waitForTimeout(300);
    await forwardButton.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch' });
    const movedY = await page.evaluate(() => (window as any).__SIMULATION__.player.y);
    expect(movedY).toBeLessThan(initialY);
  });
});

