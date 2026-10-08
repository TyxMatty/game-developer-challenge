# Pirate Battle - Architecture and Design Decisions

## Runtime Boundaries

- `tsconfig.app.json` and `tsconfig.node.json` enable TypeScript `strict` mode; `npm run typecheck` checks both project references.
- `src/game/Simulation.ts` owns the active match state: player, enemies, projectiles, islands, cooldowns, score, health, and remaining time. It implements movement, spawning, collisions, damage, and termination.
- `src/game/Renderer.ts` owns the PixiJS application and mirrors simulation entities into sprites and graphics. It loads textures through `PIXI.Assets`, updates the display from the Pixi ticker, and creates short-lived explosion animations when enemies disappear.
- React owns navigation, menus, configuration, HUD snapshots, pause UI, and the lifecycle of a match. `GameCanvas.tsx` creates and destroys the simulation and renderer, forwards game-over results, and displays asset loading progress or errors.

The simulation is decoupled from PixiJS and React, but it is browser-oriented: it uses `window`, `requestAnimationFrame`, keyboard events, viewport dimensions, and a `window.__SIMULATION__` test hook. It should not be described as a platform-independent or pure TypeScript module.

## Simulation and Rendering

The simulation uses `requestAnimationFrame` and derives a delta in seconds from each frame. A frame delta is capped at 0.1 seconds. Movement, cooldowns, timers, enemy spawning, and projectile motion use that delta. While paused, the loop continues scheduling frames without updating game state; resuming resets the time origin and clears held inputs.

Playwright installs a fixed gameplay seed in each fresh page context. `Simulation` uses a seeded PRNG for enemy spawn positions and type selection only when this test configuration is present; ordinary sessions continue to use `Math.random()`. Tests may enable `manualClock` and call `advanceTestTime(ms)`, which advances the real simulation update in steps capped at 100 ms while the render loop stays active. This makes test time deterministic without bypassing inputs, collision logic, or rendering.

The PixiJS ticker reads simulation state and updates display objects. React receives a compact HUD snapshot only when the displayed time, health, or score changes, rather than receiving every position update. The player and enemy health bars, projectiles, and explosions are PixiJS objects.

## Gameplay Rules

Player and enemy movement is clamped to the viewport and resolved against island circles. Projectiles advance by their configured speed and direction and are removed on expiration, arena exit, island impact, or a single successful hit. Front cannons create one projectile; each broadside creates three and uses its own cooldown. Defeating an enemy with a player projectile awards one point. Chaser collision damages the player and removes the Chaser without awarding a point.

Enemy type ratios are normalized before selection. When both ratios are positive, the first two spawns guarantee one Chaser and one Shooter; subsequent spawns use the configured distribution. Spawn searches are bounded and skip candidates that are too close to the player or islands. Shooter firing is limited to the configured range.

## Configuration and Persistence

`src/config/GameConfig.ts` defines defaults and option limits. The Options screen persists session duration and spawn interval in local storage. `Simulation` clones the configuration at construction, so an active match uses a snapshot. The last completed match and pending match submissions are stored locally; abandoning an active match does not invoke the completion callback.

## Assets and Resource Lifecycle

`GameCanvas` dynamically imports the Pixi renderer only after entering combat. `Renderer.init()` initializes PixiJS, attaches its canvas, loads the water, ship, HUD, and explosion textures, and reports loading progress. Loaded texture references are reused for new entities within the renderer instance. `GameCanvas` cleanup stops and destroys the simulation, removes its keyboard listeners, destroys the Pixi application, and clears component references. Renderer teardown is idempotent, retains PixiJS global resource caches, and handles asynchronous initialization cancellation. Failed asset loading destroys the renderer before presenting retry UI. The app is mounted under React `StrictMode`.

The PixiJS asset cache is global. This implementation does not explicitly unload every cached URL after a match, so renderer destruction should not be interpreted as proof that all shared cached textures have been evicted from memory.

## Ranking and Match History

`src/api/client.ts` defines typed Axios requests against `/api/ranking`, `/api/history`, and `/api/match`. `src/api/queries.ts` uses TanStack Query for caching, retries, refetching, and invalidation. Successful match registration invalidates ranking and history queries. Failed submissions are deduplicated by match ID in a local pending queue and can be flushed later.

MSW handlers in `src/mocks/handlers.ts` implement the API in the browser. They combine fixtures with locally stored submitted matches, filter ranking entries by session configuration, sort deterministically, and paginate results. Repeated registration with the same match ID returns the existing record. `NetworkSimulator` selects a scenario persisted in local storage; its reset action clears the scenario, mock records, last result, and pending queue, then reloads the page.

MSW's service worker retains its root scope so its client can intercept API requests. Its fetch listener explicitly bypasses document navigations, leaving app-shell requests to the browser and preventing the root URL from being reported as an unhandled API request. The worker remains generated by MSW; after regenerating it on an MSW upgrade, reapply and test this small navigation bypass.

> **Note on Vercel Previews:** When deploying to Vercel, injected tools (like the Vercel Toolbar or Analytics) may trigger background requests to `GET /` or other non-API routes. Since MSW intercepts all requests but only has handlers for `/api/*`, it logs a warning (`[MSW] Warning: intercepted a request without a matching request handler`) and attempts a passthrough. This passthrough might result in a silent `TypeError: Failed to fetch` in the service worker due to cross-origin or special headers in those injected requests. This is a known, harmless artifact of running MSW in a Vercel preview environment and does not affect gameplay or mock API stability.

Available network scenarios include reproducible variable latency, history returning before delayed ranking, global HTTP 400/500 errors, ranking-only and history-only failures, network errors, empty lists, and delayed match registration that can recover idempotently after a client timeout.

## Accessible Dialogs and Mobile Input

`src/hooks/useDialogFocus.ts` focuses the first relevant control, wraps Tab/Shift+Tab, redirects focus that escapes a modal, supports contextual Escape actions, and restores the previous focus target on close. Touch controls use pointer capture and release their input on pointer-up, cancellation, or capture loss. The MSW trigger moves above the touch controls on narrow screens.

## Build Loading

The Pixi renderer is a separate dynamic chunk and is imported when gameplay starts rather than with the main menu. A production build on 2026-10-07 reported a 757.60 kB (265.02 kB gzip) entry chunk and a 262.70 kB (76.44 kB gzip) renderer chunk. This is bundle-size evidence only; it does not measure browser download timing, frame rate, or memory.

## Known Limitations

- The current Playwright suite coveras every requirement in the challenge; see the Test section in `README.md`. Playwright writes its HTML report to `playwright-report/` and retains traces, videos, and screenshots for failed tests in `test-results/`; a passing run has no failure traces to retain.
- Profiling is from a single machine (see `PERFORMANCE.md`); verify the public deployment with the deployed-site E2E command in `README.md` after each release.
