# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3-gameplay.spec.ts >> Gameplay Mechanics >> should reset match state when starting again after defeat
- Location: e2e\3-gameplay.spec.ts:189:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Start Battle' })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img "React logo" [ref=e5]
      - img "Vite logo" [ref=e6]
    - generic [ref=e7]:
      - heading "Get started" [level=1] [ref=e8]
      - paragraph [ref=e9]:
        - text: Edit
        - code [ref=e10]: src/App.tsx
        - text: and save to test
        - code [ref=e11]: HMR
    - button "Count is 0" [ref=e12]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Documentation" [level=2] [ref=e17]
      - paragraph [ref=e18]: Your questions, answered
      - list [ref=e19]:
        - listitem [ref=e20]:
          - link "Explore Vite" [ref=e21] [cursor=pointer]:
            - /url: https://vite.dev/
        - listitem [ref=e22]:
          - link "Learn more" [ref=e23] [cursor=pointer]:
            - /url: https://react.dev/
    - generic [ref=e24]:
      - heading "Connect with us" [level=2] [ref=e27]
      - paragraph [ref=e28]: Join the Vite community
      - list [ref=e29]:
        - listitem [ref=e30]:
          - link "GitHub" [ref=e31] [cursor=pointer]:
            - /url: https://github.com/vitejs/vite
        - listitem [ref=e34]:
          - link "Discord" [ref=e35] [cursor=pointer]:
            - /url: https://chat.vite.dev/
        - listitem [ref=e38]:
          - link "X.com" [ref=e39] [cursor=pointer]:
            - /url: https://x.com/vite_js
        - listitem [ref=e42]:
          - link "Bluesky" [ref=e43] [cursor=pointer]:
            - /url: https://bsky.app/profile/vite.dev
```

# Test source

```ts
  91  |       return Math.hypot(player.x - islandX, player.y - islandY);
  92  |     }, { islandX: island.x, islandY: island.y });
  93  |     expect(distanceFromIsland).toBeGreaterThanOrEqual(island.radius + 19);
  94  |   });
  95  | 
  96  |   test('should make Shooters fire only in range and Chasers damage on contact', async ({ page }) => {
  97  |     await page.goto('/');
  98  |     await page.getByRole('button', { name: 'Start Battle' }).click();
  99  |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  100 | 
  101 |     await page.evaluate(() => {
  102 |       const simulation = (window as any).__SIMULATION__;
  103 |       simulation.spawnTimer = 100;
  104 |       simulation.enemies.push({
  105 |         id: 990,
  106 |         type: 'shooter',
  107 |         x: simulation.player.x,
  108 |         y: simulation.player.y + simulation.config.enemy.shooter.range + 50,
  109 |         rotation: 0,
  110 |         health: simulation.config.enemy.shooter.health,
  111 |         speed: 0,
  112 |         cooldown: 0,
  113 |       });
  114 |     });
  115 |     await page.waitForTimeout(250);
  116 |     expect(await page.evaluate(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'enemy'))).toBe(false);
  117 | 
  118 |     await page.evaluate(() => {
  119 |       const simulation = (window as any).__SIMULATION__;
  120 |       const shooter = simulation.enemies.find((enemy: any) => enemy.id === 990);
  121 |       shooter.y = simulation.player.y + simulation.config.enemy.shooter.range - 1;
  122 |       shooter.cooldown = 0;
  123 |     });
  124 |     await page.waitForFunction(() => (window as any).__SIMULATION__.projectiles.some((projectile: any) => projectile.owner === 'enemy'));
  125 | 
  126 |     const healthBeforeImpact = await page.evaluate(() => (window as any).__SIMULATION__.player.health);
  127 |     await page.evaluate(() => {
  128 |       const simulation = (window as any).__SIMULATION__;
  129 |       simulation.enemies = simulation.enemies.filter((enemy: any) => enemy.id !== 990);
  130 |       simulation.projectiles = simulation.projectiles.filter((projectile: any) => projectile.owner !== 'enemy');
  131 |       simulation.enemies.push({
  132 |         id: 991,
  133 |         type: 'chaser',
  134 |         x: simulation.player.x + 10,
  135 |         y: simulation.player.y,
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
> 191 |     await page.getByRole('button', { name: 'Start Battle' }).click();
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  236 |     await expect(page.getByRole('banner', { name: 'Combat Heads-Up Display' })).toBeVisible();
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
```