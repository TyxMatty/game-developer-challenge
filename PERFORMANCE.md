# Performance Profiling Status

## Evidence Status

No reproducible production-build profiling evidence is currently available in this repository. The previously listed FPS, frame-time, scripting-time, memory, and entity-count figures did not include captured traces or a verifiable run record, so they are intentionally not reported as measured results here.

| Required measurement | Current status |
| --- | --- |
| Reference hardware, OS, browser, resolution, and device-pixel ratio | Not recorded for a profiling run |
| Average FPS and p95 frame interval during a 3-minute match | Not measured |
| Peak enemy, projectile, and rendered-object counts | Not captured from a profiling run |
| Heap behavior over five start/play/exit cycles | Not measured with retained snapshots |
| Chrome Performance and Memory evidence | Not attached |

## Reproducible Measurement Procedure

1. Run `npm ci`, `npm run build`, and `npm run preview`; profile the preview build, not the Vite development server.
2. Record OS, CPU, GPU, available memory, browser version, viewport, and device-pixel ratio.
3. Set session duration to 180 seconds and spawn interval to 2 seconds. Capture a full three-minute match using Chrome DevTools Performance. Record average FPS and the p95 frame interval, and inspect the `Simulation.update()` call cost.
4. Record peak enemies, projectiles, and display objects from the same run. Keep the test actions and configuration identical when comparing revisions.
5. Capture a heap snapshot at the main menu, then run five consistent start/play/exit cycles. Force garbage collection when available and capture a final snapshot. Compare retained objects and heap size; do not infer GPU texture release from JavaScript heap size alone.
6. Save the raw trace, heap snapshots, and a short run log alongside this report before replacing the `Not measured` entries with results.

## Code-Level Considerations

- `Simulation.update()` caps each frame delta at 0.1 seconds. This limits large catch-up updates but does not itself prove a 60 FPS result.
- `resolvePhysics()` checks pairs among the player and enemies, making ship-to-ship checks quadratic in the number of ships. The simulation currently stops spawning after 50 active enemies.
- `Renderer.render()` creates sets while synchronizing projectile and enemy IDs and updates health-bar masks each ticker frame. These paths should be included in a measured performance trace before optimization claims are made.
- `Renderer.destroy()` destroys the PixiJS application, but PixiJS assets are managed by a global cache and are not explicitly unloaded by URL. Memory conclusions require snapshots and should distinguish JavaScript heap from GPU resources.

## Result Log

Add one entry per verified run with the commit or source revision, date, environment, configuration, FPS average, p95 frame interval, peak entity counts, and five-cycle memory observations. Until then, the performance criterion remains unverified.

