# EPEC (Jungle Gaming Edition): Development Plan and Task Breakdown

Matty here! This is the plan focused on the Pirate Battle challenge, based on the test's README and using the same modular and scalable principles I follow.

---

## What we already have (our base):
- [x] Project setup (React, TypeScript, Vite).
- [x] Dependencies installed (PixiJS, TanStack Query, Axios, MSW, Playwright).

---

## Next Steps (tasks to execute)

### Task 1: Base Architecture and Game (Simulation Layer)
- [x] Separate the simulation logic in plain TypeScript from the PixiJS renderer.
- [x] Implement a frame-rate-independent game cycle (Update Loop, time/delta based).
- [x] Centralized combat state management.

### Task 2: Rendering with PixiJS (View Layer)
- [x] Initialize the PixiJS canvas inside React.
- [x] Asset loader (textures and spritesheets).
- [x] Map the simulation state to the visual PixiJS sprites.

### Task 3: Gameplay and Controls
- [x] Player movement and rotation (WASD / arrow keys).
- [x] Firing controls (front and sides).
- [x] Enemy spawning and AI (Chaser and Shooter).
- [x] Damage, health, and collision system (with islands and arena bounds).

### Task 4: Interface and Menus (React Layer)
- [x] Main menu (Play, Options, Ranking, Match History).
- [x] Options screen (session duration, enemy spawn, local persistence).
- [x] In-game HUD (score, remaining time, health).
- [x] Results screen.

### Task 5: Visual Polish (Effects and Extra Sprites)
- [x] Use extra textures from the /assets folder.
- [x] Implement explosion animations when ships are destroyed.
- [x] Water effects, smoke, or bullet trails (muzzle flash and smoke trail added).

### Task 6: Mocking (MSW) and API (TanStack + Axios)
- [x] Configure MSW to simulate /ranking and /history.
- [x] Axios and TanStack Query integration.
- [x] Failure, timeout, and slowness scenarios simulated and handled.

### Task 7: Quality and Testing (Playwright)
- [x] E2E tests for the interface flows.
- [x] Gameplay and visual regression tests.
- [x] Performance profiling and final adjustments.
