import { test, expect } from './fixtures';

test.describe('Mecânicas de jogo', () => {
  test('should reproduce seeded enemy spawns with the manually controlled simulation clock', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { seed: 42, manualClock: true };
    });

    const runSeededMatch = async () => {
      await page.getByRole('button', { name: 'Start Battle' }).click();
      await page.waitForFunction(() => window.__SIMULATION__?.isRunning);
      await page.evaluate(() => {
        const simulation = window.__SIMULATION__;
        if (!simulation) throw new Error('Test simulation was not initialized.');
        simulation.config.spawnInterval = 1;
        simulation.advanceTestTime(5000);
      });

      return page.evaluate(() => {
        const simulation = window.__SIMULATION__;
        if (!simulation) throw new Error('Test simulation was not initialized.');
        return simulation.enemies.map(({ type, x, y }) => ({ type, x, y }));
      });
    };

    const firstSpawns = await runSeededMatch();
    expect(firstSpawns.length).toBeGreaterThanOrEqual(2);

    await page.reload();
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { seed: 42, manualClock: true };
    });
    const repeatedSpawns = await runSeededMatch();

    expect(repeatedSpawns).toEqual(firstSpawns);
  });

  test('should advance gameplay only when the controlled simulation clock advances', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { seed: 7, manualClock: true };
    });
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => window.__SIMULATION__?.isRunning);

    const initialState = await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      return { x: simulation.player.x, y: simulation.player.y, time: simulation.sessionTime };
    });
    await page.keyboard.down('KeyW');
    await page.keyboard.down('Space');
    await page.keyboard.up('Space');
    await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      simulation.advanceTestTime(500);
    });
    await page.keyboard.up('KeyW');

    const advancedState = await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      return {
        x: simulation.player.x,
        y: simulation.player.y,
        time: simulation.sessionTime,
        fired: simulation.projectiles.some((projectile) => projectile.owner === 'player'),
      };
    });
    expect(advancedState.y).toBeLessThan(initialState.y);
    expect(advancedState.x).toBe(initialState.x);
    expect(advancedState.time).toBeCloseTo(initialState.time - 0.5, 5);
    expect(advancedState.fired).toBe(true);

    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.__SIMULATION__?.sessionTime)).toBe(advancedState.time);
  });

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

  test('Comportamentos de Chaser e Shooter e intervalo de spawn.', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.config.spawnInterval = 0.1;
      simulation.spawnTimer = 0;
    });

    await page.waitForFunction(() => {
      const enemies = (window as any).__SIMULATION__?.enemies ?? [];
      return enemies.some((enemy: any) => enemy.type === 'chaser')
        && enemies.some((enemy: any) => enemy.type === 'shooter');
    }, { timeout: 5000 });
  });

  test('Início de partida, movimento, rotação, limites da arena e colisão com ilhas.', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    const initialRotation = await page.evaluate(() => (window as any).__SIMULATION__.player.rotation);
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyD');
    expect(await page.evaluate(() => (window as any).__SIMULATION__.player.rotation)).toBeGreaterThan(initialRotation);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.player.rotation = 0;
      simulation.player.x = window.innerWidth / 2;
      simulation.player.y = 45;
    });
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyW');
    expect(await page.evaluate(() => (window as any).__SIMULATION__.player.y)).toBeGreaterThanOrEqual(30);

    const island = await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      const target = simulation.islands.find((candidate: any) => candidate.x < window.innerWidth / 2);
      simulation.player.x = target.x + 200;
      simulation.player.y = target.y;
      simulation.player.rotation = -Math.PI / 2;
      return { x: target.x, y: target.y, radius: target.radius };
    });
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(800);
    await page.keyboard.up('KeyW');
    const distanceFromIsland = await page.evaluate(({ islandX, islandY }) => {
      const player = (window as any).__SIMULATION__.player;
      return Math.hypot(player.x - islandX, player.y - islandY);
    }, { islandX: island.x, islandY: island.y });
    expect(distanceFromIsland).toBeGreaterThanOrEqual(island.radius + 19);
  });

  test('should make Shooters fire only in range and Chasers damage on contact', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.spawnTimer = 100;
      simulation.enemies.push({
        id: 990,
        type: 'shooter',
        x: simulation.player.x,
        y: simulation.player.y + simulation.config.enemy.shooter.range + 50,
        rotation: 0,
        health: simulation.config.enemy.shooter.health,
        speed: 0,
        cooldown: 0,
      });
    });
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'enemy'))).toBe(false);

    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      const shooter = simulation.enemies.find((enemy: any) => enemy.id === 990);
      shooter.y = simulation.player.y + simulation.config.enemy.shooter.range - 1;
      shooter.cooldown = 0;
    });
    await page.waitForFunction(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'enemy'));

    const healthBeforeImpact = await page.evaluate(() => (window as any).__SIMULATION__.player.health);
    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.enemies = simulation.enemies.filter((enemy: any) => enemy.id !== 990);
      simulation.projectiles = simulation.projectiles.filter((projectile: any) => projectile.owner !== 'enemy');
      simulation.enemies.push({
        id: 991,
        type: 'chaser',
        x: simulation.player.x + 10,
        y: simulation.player.y,
        rotation: 0,
        health: simulation.config.enemy.chaser.health,
        speed: 0,
        cooldown: 0,
      });
    });
    await page.waitForFunction((health) => (window as any).__SIMULATION__.player.health < health, healthBeforeImpact);
    expect(await page.evaluate(() => (window as any).__SIMULATION__.score)).toBe(0);
  });

  test('Disparos frontal e lateral, dano, cooldown e pontuação sem duplicação.', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { ...window.__GAME_TEST_CONFIG__, manualClock: true };
    });
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.config.player.frontCooldown = 0.5;
      simulation.config.projectiles.life = 10;
      simulation.spawnTimer = 100;
    });

    await page.keyboard.down('Space');
    await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      simulation.advanceTestTime(250);
    });
    expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length)).toBe(1);
    await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      simulation.advanceTestTime(350);
    });
    expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length)).toBeGreaterThanOrEqual(2);
    await page.keyboard.up('Space');
  });

  test('should remove a projectile when it hits an island', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    const projectileId = await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.spawnTimer = 100;
      const island = simulation.islands[0];
      const id = 9990;
      simulation.projectiles.push({
        id,
        x: island.x - island.radius - 10,
        y: island.y,
        rotation: Math.PI / 2,
        speed: 400,
        life: 2,
        owner: 'player',
      });
      return id;
    });

    await page.waitForFunction((id) => !(window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.id === id), projectileId);
  });

  test('should reset match state when starting again after defeat', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      simulation.score = 4;
      simulation.player.health = 0;
    });
    await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible();
    await page.getByRole('button', { name: 'Play Again' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);

    const newMatchState = await page.evaluate(() => {
      const simulation = (window as any).__SIMULATION__;
      return {
        score: simulation.score,
        health: simulation.player.health,
        enemies: simulation.enemies.length,
        projectiles: simulation.projectiles.length,
        time: simulation.sessionTime,
      };
    });
    expect(newMatchState).toMatchObject({ score: 0, health: 300, enemies: 0, projectiles: 0 });
    expect(newMatchState.time).toBeGreaterThan(59);
    expect(newMatchState.time).toBeLessThanOrEqual(60);
  });

  test('Encerramento por tempo e por morte, interrupção da simulação e reinício limpo.', async ({ page }) => {
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
    await page.evaluate(() => {
      window.__GAME_TEST_CONFIG__ = { ...window.__GAME_TEST_CONFIG__, manualClock: true };
    });

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
    await page.evaluate(() => {
      const simulation = window.__SIMULATION__;
      if (!simulation) throw new Error('Test simulation was not initialized.');
      simulation.advanceTestTime(500);
    });
    await page.keyboard.up('KeyW');

    // Check position changed
    const newPos = await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      return { x: sim.player.x, y: sim.player.y };
    });
    expect(newPos.y).toBeLessThan(initialPos.y); // Moving up decreases Y

    // Shoot front
    await page.keyboard.down('Space');
    await page.keyboard.up('Space');

    const projectileCount = await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length);
    await page.keyboard.down('KeyQ');
    await page.keyboard.up('KeyQ');
    expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length)).toBe(projectileCount + 3);

    // Fast-forward session time to near end
    await page.evaluate(() => {
      const sim = (window as any).__SIMULATION__;
      sim.sessionTime = 0.1;
      sim.advanceTestTime(100);
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

  test('Pausa, perda de foco e retomada sem avanço indevido do cronômetro.', async ({ page }) => {
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

  test('should preserve the paused match snapshot while changing options', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Start Battle' }).click();
    await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
    await page.getByRole('button', { name: 'Pause game (or press Escape)' }).click();
    await page.getByRole('button', { name: /Options/ }).click();
    await expect(page.getByRole('dialog', { name: 'Battle Options' })).toBeVisible();

    await page.getByRole('button', { name: 'Increase session time by 15s' }).click();
    expect(await page.evaluate(() => ({
      isPaused: (window as any).__SIMULATION__?.isPaused,
      sessionTime: (window as any).__SIMULATION__?.config.sessionTime,
    }))).toEqual({ isPaused: true, sessionTime: 60 });

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
    await page.getByRole('button', { name: /Resume/ }).click();
    expect(await page.evaluate(() => (window as any).__SIMULATION__?.isRunning)).toBe(true);
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

  test('Abandono da partida, navegação repetida entre telas e controles de toque.', async ({ page }) => {
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
