# Performance Profiling Status

## Evidence Status

Measured with `npm run build` followed by `npm run profile` (`scripts/profile.mjs`), which serves the **production preview build**, plays a full match with scripted input (hold forward, alternate turns, fire front/left/right cannons), samples every `requestAnimationFrame` interval, and then runs repeated start/exit cycles measuring the JS heap after forced GC. Raw output: [`perf-results/latest.json`](perf-results/latest.json).

| Measurement | Result |
| --- | --- |
| Environment | Windows 11 (10.0.26200), AMD Ryzen 5 5600G (12 threads), 15.8 GB RAM, Chromium 156.0.8078.4 headed, 1280x720, DPR 1 |
| Match length | 180 s (32,413 frames sampled) |
| Average FPS | 179.7 (display refresh-limited; mean frame interval 5.57 ms) |
| Frame interval p50 / p95 / p99 / max | 5.6 / 5.7 / 5.7 / 72.2 ms |
| Peak enemies / projectiles | 16 / 17 |
| JS heap after 5 start/exit cycles (MB) | 3.16 (menu) -> 2.27, 2.27, 2.27, 2.26 (no growth) |
| Console errors during run | none |

Caveats: the player was given effectively unlimited health so the 180 s match could be completed with scripted input; the single 72 ms outlier is the first-frame/initial load spike. Headless Chromium on the same machine is software-rendered and capped at ~31 FPS (p50 33.3 ms), so headed mode is the reference. GPU memory is not measured by the JS heap figure. Results are from one machine and are not a guarantee for low-end or mobile devices.

The production build reports an entry chunk of ~757 kB (265 kB gzip) and a separate renderer chunk, so Pixi is split from the menu's initial bundle, although the entry still exceeds Vite's 500 kB warning threshold.

## Reproducible Measurement Procedure

0. Quick path: `npm run build` then `npm run profile` (set `PROFILE_HEADED=1` for headed Chromium).
1. Run `npm ci`, `npm run build`, and `npm run preview`; profile the preview build, not the Vite development server.
2. Record OS, CPU, GPU, available memory, browser version, viewport, and device-pixel ratio.
3. Set session duration to 180 seconds and spawn interval to 2 seconds. Capture a full three-minute match using Chrome DevTools Performance. Record average FPS and the p95 frame interval, and inspect the `Simulation.update()` call cost.
4. Record peak enemies, projectiles, and display objects from the same run. Keep the test actions and configuration identical when comparing revisions.
5. Capture a heap snapshot at the main menu, then run five consistent start/play/exit cycles. Force garbage collection when available and capture a final snapshot. Compare retained objects and heap size; do not infer GPU texture release from JavaScript heap size alone.
6. Save the raw trace, heap snapshots, and a short run log alongside this report before replacing the `Not measured` entries with results.

## Code-Level Considerations

- `Simulation.update()` caps each frame delta at 0.1 seconds, which limits large catch-up updates after a stalled frame.
- `resolvePhysics()` checks pairs among the player and enemies, making ship-to-ship checks quadratic in the number of ships. The simulation stops spawning after 50 active enemies, and the measured run peaked at 16 enemies and 17 projectiles.
- `Renderer.render()` creates `Set` objects while synchronizing projectile and enemy IDs and redraws health-bar masks each ticker frame. The measured run (p95 frame interval 5.7 ms) showed no sign that these paths limit frame rate, but their cost was not profiled per function.
- `GameCanvas` dynamically imports PixiJS for gameplay. `Renderer.destroy()` keeps global caches intact to avoid invalidating shared resources, and assets are not explicitly unloaded by URL. The five-cycle result is a JavaScript heap measurement after forced garbage collection; it does not cover GPU memory.
- Mobile devices were not profiled, and the GPU model was not recorded in the environment row.

## Extra Considerations

- **Complexity:** `resolvePhysics()` in `Simulation.ts` is O(n²) in the number of ships. Spatial partitioning (for example a quadtree) would bring it closer to O(n log n), but with spawning capped at 50 enemies it was not needed; it would be the fix if the cap grew to thousands of enemies.

## Result Log

- 2026-10-08, local working tree, environment above, default configuration with a 180 s session: 179.7 FPS average, p95 frame interval 5.7 ms, peak 16 enemies and 17 projectiles, stable 2.27 MB heap across 5 start/exit cycles.