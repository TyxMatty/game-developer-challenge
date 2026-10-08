# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3-gameplay.spec.ts >> Gameplay Mechanics >> should spawn both enemy types with the standard distribution
- Location: e2e\3-gameplay.spec.ts:38:3

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Gameplay Mechanics', () => {
  4   |   test('should award one point for each enemy destroyed', async ({ page }) => {
  5   |     await page.goto('/');
  6   |     await page.getByRole('button', { name: 'Start Battle' }).click();
  7   |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  8   | 
  9   |     await page.evaluate(() => {
  10  |       const simulation = (window as any).__SIMULATION__;
  11  |       const enemy = {
  12  |         id: 999,
  13  |         type: 'chaser',
  14  |         x: simulation.player.x + 60,
  15  |         y: simulation.player.y,
  16  |         rotation: 0,
  17  |         health: 1,
  18  |         speed: 0,
  19  |         cooldown: 0,
  20  |       };
  21  |       simulation.enemies.push(enemy);
  22  |       simulation.projectiles.push({
  23  |         id: 999,
  24  |         x: enemy.x - 20,
  25  |         y: enemy.y,
  26  |         rotation: Math.PI / 2,
  27  |         speed: 400,
  28  |         life: 2,
  29  |         owner: 'player',
  30  |       });
  31  |     });
  32  | 
  33  |     await page.waitForFunction(() => (window as any).__SIMULATION__?.score === 1);
  34  |     await page.waitForTimeout(100);
  35  |     expect(await page.evaluate(() => (window as any).__SIMULATION__.score)).toBe(1);
  36  |   });
  37  | 
  38  |   test('should spawn both enemy types with the standard distribution', async ({ page }) => {
  39  |     await page.goto('/');
> 40  |     await page.getByRole('button', { name: 'Start Battle' }).click();
      |                                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  41  |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  42  | 
  43  |     await page.evaluate(() => {
  44  |       const simulation = (window as any).__SIMULATION__;
  45  |       simulation.config.spawnInterval = 0.1;
  46  |       simulation.spawnTimer = 0;
  47  |     });
  48  | 
  49  |     await page.waitForFunction(() => {
  50  |       const enemies = (window as any).__SIMULATION__?.enemies ?? [];
  51  |       return enemies.some((enemy: any) => enemy.type === 'chaser')
  52  |         && enemies.some((enemy: any) => enemy.type === 'shooter');
  53  |     }, { timeout: 5000 });
  54  |   });
  55  | 
  56  |   test('should rotate, stay inside arena bounds, and stop at an island', async ({ page }) => {
  57  |     await page.goto('/');
  58  |     await page.getByRole('button', { name: 'Start Battle' }).click();
  59  |     await page.waitForFunction(() => (window as any).__SIMULATION__?.isRunning);
  60  | 
  61  |     const initialRotation = await page.evaluate(() => (window as any).__SIMULATION__.player.rotation);
  62  |     await page.keyboard.down('KeyD');
  63  |     await page.waitForTimeout(300);
  64  |     await page.keyboard.up('KeyD');
  65  |     expect(await page.evaluate(() => (window as any).__SIMULATION__.player.rotation)).toBeGreaterThan(initialRotation);
  66  | 
  67  |     await page.evaluate(() => {
  68  |       const simulation = (window as any).__SIMULATION__;
  69  |       simulation.player.rotation = 0;
  70  |       simulation.player.x = window.innerWidth / 2;
  71  |       simulation.player.y = 45;
  72  |     });
  73  |     await page.keyboard.down('KeyW');
  74  |     await page.waitForTimeout(300);
  75  |     await page.keyboard.up('KeyW');
  76  |     expect(await page.evaluate(() => (window as any).__SIMULATION__.player.y)).toBeGreaterThanOrEqual(30);
  77  | 
  78  |     const island = await page.evaluate(() => {
  79  |       const simulation = (window as any).__SIMULATION__;
  80  |       const target = simulation.islands.find((candidate: any) => candidate.x < window.innerWidth / 2);
  81  |       simulation.player.x = target.x + 200;
  82  |       simulation.player.y = target.y;
  83  |       simulation.player.rotation = -Math.PI / 2;
  84  |       return { x: target.x, y: target.y, radius: target.radius };
  85  |     });
  86  |     await page.keyboard.down('KeyW');
  87  |     await page.waitForTimeout(800);
  88  |     await page.keyboard.up('KeyW');
  89  |     const distanceFromIsland = await page.evaluate(({ islandX, islandY }) => {
  90  |       const player = (window as any).__SIMULATION__.player;
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
```