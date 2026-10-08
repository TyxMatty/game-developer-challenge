# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3-gameplay.spec.ts >> Gameplay Mechanics >> should allow playing the game, moving, shooting, and finishing
- Location: e2e\3-gameplay.spec.ts:232:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('banner', { name: 'Combat Heads-Up Display' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('banner', { name: 'Combat Heads-Up Display' }) with timeout 5000ms
  - waiting for getByRole('banner', { name: 'Combat Heads-Up Display' })

```

```yaml
- status:
  - img "Pirate Battle"
  - heading "Preparing the Fleet... 84%" [level=2]
- button "📡 MSW DevTools"
- button "select to enable accessibility for this content"
```

# Test source

```ts
  136 |         rotation: 0,
  137 |         health: simulation.config.enemy.chaser.health,
  138 |         speed: 0,
  139 |         cooldown: 0,
  140 |       });
  141 |     });
  142 |     await page.waitForFunction((health) => (window as any).__SIMULATION__.player.health < health, healthBeforeImpact);
  143 |     expect(await page.evaluate(() => (window as any).__SIMULATION__.score)).toBe(0);
  144 |   });
  145 | 
  146 |   test('should respect the front cannon cooldown', async ({ page }) => {
  147 |     await page.goto('/');
  148 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  149 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  150 |     await page.evaluate(() => {
  151 |       const simulation = (window as any).__SIMULATION__;
  152 |       simulation.config.player.frontCooldown = 0.5;
  153 |       simulation.config.projectiles.life = 10;
  154 |       simulation.spawnTimer = 100;
  155 |     });
  156 | 
  157 |     await page.keyboard.down('Space');
  158 |     await page.waitForTimeout(250);
  159 |     expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length)).toBe(1);
  160 |     await page.waitForFunction(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length >= 2);
  161 |     await page.keyboard.up('Space');
  162 |   });
  163 | 
  164 |   test('should remove a projectile when it hits an island', async ({ page }) => {
  165 |     await page.goto('/');
  166 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  167 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  168 | 
  169 |     const projectileId = await page.evaluate(() => {
  170 |       const simulation = (window as any).__SIMULATION__;
  171 |       simulation.spawnTimer = 100;
  172 |       const island = simulation.islands[0];
  173 |       const id = 9990;
  174 |       simulation.projectiles.push({
  175 |         id,
  176 |         x: island.x - island.radius - 10,
  177 |         y: island.y,
  178 |         rotation: Math.PI / 2,
  179 |         speed: 400,
  180 |         life: 2,
  181 |         owner: 'player',
  182 |       });
  183 |       return id;
  184 |     });
  185 | 
  186 |     await page.waitForFunction((id) => !(window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.id === id), projectileId);
  187 |   });
  188 | 
  189 |   test('should reset match state when starting again after defeat', async ({ page }) => {
  190 |     await page.goto('/');
  191 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  192 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  193 |     await page.evaluate(() => {
  194 |       const simulation = (window as any).__SIMULATION__;
  195 |       simulation.score = 4;
  196 |       simulation.player.health = 0;
  197 |     });
  198 |     await expect(page.getByRole('heading', { name: 'Ship Sunk!' })).toBeVisible();
  199 |     await page.getByRole('button', { name: 'Play Again' }).click();
  200 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  201 | 
  202 |     const newMatchState = await page.evaluate(() => {
  203 |       const simulation = (window as any).__SIMULATION__;
  204 |       return {
  205 |         score: simulation.score,
  206 |         health: simulation.player.health,
  207 |         enemies: simulation.enemies.length,
  208 |         projectiles: simulation.projectiles.length,
  209 |         time: simulation.sessionTime,
  210 |       };
  211 |     });
  212 |     expect(newMatchState).toMatchObject({ score: 0, health: 300, enemies: 0, projectiles: 0 });
  213 |     expect(newMatchState.time).toBeGreaterThan(59);
  214 |     expect(newMatchState.time).toBeLessThanOrEqual(60);
  215 |   });
  216 | 
  217 |   test('should report timeout as the termination reason when the timer expires with a score', async ({ page }) => {
  218 |     await page.goto('/');
  219 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  220 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  221 | 
  222 |     await page.evaluate(() => {
  223 |       const simulation = (window as any).__SIMULATION__;
  224 |       simulation.score = 1;
  225 |       simulation.sessionTime = 0.05;
  226 |     });
  227 | 
  228 |     await expect(page.getByRole('heading', { name: 'Time Expired!' })).toBeVisible({ timeout: 5000 });
  229 |     await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('pirate_last_completed_match') || 'null')?.reason)).toBe('time_out');
  230 |   });
  231 | 
  232 |   test('should allow playing the game, moving, shooting, and finishing', async ({ page }) => {
  233 |     await page.goto('/');
  234 | 
  235 |     await page.getByRole('button', { name: 'Start Battle' }).click();
> 236 |     await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
      |                                                                                 ^ Error: expect(locator).toBeVisible() failed
  237 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  238 | 
  239 |     // Initial position
  240 |     const initialPos = await page.evaluate(() => {
  241 |       const sim = (window as any).__SIMULATION__;
  242 |       return { x: sim.player.x, y: sim.player.y };
  243 |     });
  244 | 
  245 |     // Press W to move forward
  246 |     await page.keyboard.down('KeyW');
  247 |     await page.waitForTimeout(500); // Wait for movement
  248 |     await page.keyboard.up('KeyW');
  249 | 
  250 |     // Check position changed
  251 |     const newPos = await page.evaluate(() => {
  252 |       const sim = (window as any).__SIMULATION__;
  253 |       return { x: sim.player.x, y: sim.player.y };
  254 |     });
  255 |     expect(newPos.y).toBeLessThan(initialPos.y); // Moving up decreases Y
  256 | 
  257 |     // Shoot front
  258 |     await page.keyboard.down('Space');
  259 |     await page.waitForFunction(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'player'));
  260 |     await page.keyboard.up('Space');
  261 | 
  262 |     const projectileCount = await page.evaluate(() => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length);
  263 |     await page.keyboard.down('KeyQ');
  264 |     await page.waitForFunction((initialCount) => (window as any).__SIMULATION__.projectiles.filter((projectile: any) => projectile.owner === 'player').length >= initialCount + 3, projectileCount);
  265 |     await page.keyboard.up('KeyQ');
  266 | 
  267 |     // Fast-forward session time to near end
  268 |     await page.evaluate(() => {
  269 |       const sim = (window as any).__SIMULATION__;
  270 |       sim.sessionTime = 0.1;
  271 |     });
  272 | 
  273 |     // Wait for match to end automatically
  274 |     await expect(page.getByRole('heading', { name: 'Time Expired!' })).toBeVisible({ timeout: 5000 });
  275 | 
  276 |     // Verify Result Modal contains score
  277 |     await expect(page.getByText(/Final Score:/)).toBeVisible();
  278 |     await expect(page.getByRole('button', { name: 'Play Again' })).toBeVisible();
  279 |     await expect(page.getByRole('button', { name: 'Main Menu' })).toBeVisible();
  280 | 
  281 |     // Go to Main Menu
  282 |     await page.getByRole('button', { name: 'Main Menu' }).click();
  283 |     await expect(page.getByRole('button', { name: 'Start Battle' })).toBeVisible();
  284 |   });
  285 | 
  286 |   test('should pause and resume correctly without skipping time', async ({ page }) => {
  287 |     await page.goto('/');
  288 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  289 | 
  290 |     await page.waitForFunction(() => (window as any).__SIMULATION__ !== undefined);
  291 | 
  292 |     // Pause by clicking the button
  293 |     await page.getByRole('button', { name: 'Pause game (or press Escape)' }).click();
  294 |     
  295 |     await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
  296 | 
  297 |     const timeWhilePaused = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
  298 | 
  299 |     await page.waitForTimeout(1000); // wait 1 sec
  300 | 
  301 |     const timeAfterWait = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
  302 |     
  303 |     // Time should not have decreased
  304 |     expect(timeAfterWait).toBe(timeWhilePaused);
  305 | 
  306 |     // Resume
  307 |     await page.getByRole('button', { name: 'Resume' }).click();
  308 | 
  309 |     await page.waitForTimeout(1000);
  310 |     const timeAfterResume = await page.evaluate(() => (window as any).__SIMULATION__.sessionTime);
  311 |     expect(timeAfterResume).toBeLessThan(timeWhilePaused);
  312 |   });
  313 | 
  314 |   test('should preserve the paused match snapshot while changing options', async ({ page }) => {
  315 |     await page.goto('/');
  316 |     await page.getByRole('button', { name: 'Start Battle' }).click();
  317 |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  318 |     await page.getByRole('button', { name: 'Pause game (or press Escape)' }).click();
  319 |     await page.getByRole('button', { name: /Options/ }).click();
  320 |     await expect(page.getByRole('dialog', { name: 'Battle Options' })).toBeVisible();
  321 | 
  322 |     await page.getByRole('button', { name: 'Increase session time by 15s' }).click();
  323 |     expect(await page.evaluate(() => ({
  324 |       isPaused: (window as any).__SIMULATION__?.isPaused,
  325 |       sessionTime: (window as any).__SIMULATION__?.config.sessionTime,
  326 |     }))).toEqual({ isPaused: true, sessionTime: 60 });
  327 | 
  328 |     await page.getByRole('button', { name: 'Back' }).click();
  329 |     await expect(page.getByRole('heading', { name: 'Paused' })).toBeVisible();
  330 |     await page.getByRole('button', { name: /Resume/ }).click();
  331 |     expect(await page.evaluate(() => (window as any).__SIMULATION__?.isRunning)).toBe(true);
  332 |   });
  333 | 
  334 |   test('should auto-pause on focus loss and resume only after an action', async ({ page }) => {
  335 |     await page.goto('/');
  336 |     await page.getByRole('button', { name: 'Start Battle' }).click();
```