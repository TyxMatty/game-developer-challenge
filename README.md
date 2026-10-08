# Pirate Battle - Solution Guide

The original challenge statement is in [INSTRUCTIONS.md](INSTRUCTIONS.md).

## Local Setup

Requirements: Node.js compatible with the versions in `package-lock.json` and npm.
The application and Vite configuration are type-checked with TypeScript `strict` mode.

```bash
npm ci
npm run dev
```

No environment variables or private services are required. MSW intercepts the ranking and match-history API requests in the browser. The production build is served from `dist/`.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript project checks and create the production build. |
| `npm run preview` | Serve the production build locally. Run `npm run build` first. |
| `npm run lint` | Run Oxlint. |
| `npm run typecheck` | Run TypeScript project checks without building. |
| `npm run test:e2e` | Run Playwright tests in desktop Chromium and Mobile Chrome. |
| `npm run test:e2e:preview` | Build and run the same Playwright suite against the production preview server (`vite preview`). |
| `npm run test:e2e:ui` | Open the Playwright UI runner. |
| `npm run profile` | Profile the production preview build (FPS, frame interval, entities, heap over 5 cycles). Run `npm run build` first; see [PERFORMANCE.md](PERFORMANCE.md). |

Install the Playwright browser once with `npx playwright install chromium` (it must match the installed `@playwright/test` version) before running E2E tests.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move forward / reverse | `W` / `S` or Up / Down | Forward / reverse controls |
| Rotate | `A` / `D` or Left / Right | Left / right controls |
| Fire forward | `Space` | Bow cannon control |
| Fire left / right | `Q` / `E` | Port / starboard controls |
| Pause / resume | `Escape` | Pause menu actions |

Movement and firing can be combined. The game is playable in portrait and landscape; controls are anchored to the lower corners of the viewport.

## Gameplay Configuration

The Options screen persists the session duration (60-180 seconds in 15-second steps) and enemy spawn interval (1-10 seconds in 0.5-second steps) in browser storage. Each match uses a snapshot of the configuration taken when it starts. Other balance values are centralized in `src/config/GameConfig.ts`.

## Network Scenarios

Open **MSW DevTools** to select a scenario. On mobile its trigger is positioned above the touch controls. The selection applies to new requests and persists in local storage. Available scenarios are `success`, `empty_lists`, deterministic `slow_variable`, `out_of_order` (ranking delayed 800 ms; history delayed 100 ms), `error_400`, `error_500`, `error_ranking_only`, `error_history_only`, `network_error`, and `timeout_match_post`.

To reproduce deferred match submission, select **Timeout on Match POST**, complete a match, then select **Success (Normal)** and use the pending-match retry action. The mock stores the match before returning the delayed response, so the same match ID must not create a duplicate on retry. **Reset State & Reload** clears the mock scenario, stored mock matches, last completed match, and pending queue.

## Test and Failure Reproduction

Run the full suite with `npm run test:e2e`. The Playwright projects cover desktop Chromium and Pixel 5 emulation; the touch-only test is skipped on desktop by design. The suite includes versioned baselines for the menu, stable arena, and result view. On failure, inspect the generated Playwright HTML report and trace artifacts under `playwright-report/` and `test-results/`. Regenerate approved visual baselines with `npx playwright test e2e/5-visual-regression.spec.ts --update-snapshots`.

Latest full local run (2026-10-07, Playwright 1.64.0): 55 passed, 1 skipped (the touch-only test is skipped in desktop Chromium), across desktop Chromium and Mobile Chrome. The suite covers options persistence, asset failure/retry, scoring, enemy distribution and behaviors, cooldowns, projectile-island collision, death/restart reset, arena bounds/island collision, pause and focus loss, match preservation through Options, touch movement, ranking pagination, out-of-order and endpoint-specific failures, HTTP 400/500, match persistence/retry, MSW navigation bypass, and visual baselines. Run the same suite against the local Vite server with `npm run test:e2e` or the production preview with `npm run test:e2e:preview`. To test a deployed site, run `E2E_BASE_URL=https://your-site npx playwright test` (PowerShell: `$env:E2E_BASE_URL='https://your-site'; npx playwright test`). Baselines are platform-specific (win32); regenerate them on another OS.

## Deployment

**Public deployment URL:** https://game-developer-challenge-jade.vercel.app/

The repository includes `vercel.json`; deploy the `dist/` output on Vercel, Netlify, or Cloudflare Pages. The published origin must serve `public/mockServiceWorker.js` and allow the application to register the service worker. Its fetch listener bypasses document navigations so the browser loads the app shell directly instead of sending `GET /` through MSW; API requests remain mocked. The E2E suite includes a regression check for navigation and API mocking.

`public/mockServiceWorker.js` is generated by MSW. If refreshing it after an MSW upgrade (`npx msw init public --save`), reapply and verify the navigation bypass in its `fetch` listener.

## Supporting Documents

- [Architecture and design decisions](ARCHITECTURE.md)
- [Performance measurements and procedure](PERFORMANCE.md)
- [E2E coverage map](E2E_TESTS.md)
