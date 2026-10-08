# Pirate Battle: Code Review and Quality & Architecture Notes

History of technical reviews, design decisions, and improvements applied to the Pirate Battle challenge, following the architectural principles of anti-spaghetti and Lego, to keep the project scalable.

---

## 1. Architecture and Decoupling (Lego, not God Object)

**Core guideline:**
The golden rule is to completely separate the "Game Logic" from the "Rendering" and from the "User Interface".
- **Simulation Core (TypeScript):** Contains all rules for time, spawning, HP, cooldowns, collisions, and position. It does not depend on graphics libraries.
- **Rendering (PixiJS):** Only reads the Simulation Core and draws the matching sprites on screen.
- **Interface (React):** Overlays the canvas, shows menus, and talks to the Simulation to display Health, Time, and Score, using mechanisms that do not trigger re-renders on every frame (e.g. direct references or specialized stores).

---

## 2. State Patterns (Anti-Spaghetti)

- **Ranking and History data:** React Query exclusively handles the async cache for these two APIs.
- **Match state:** Game state must be encapsulated, making it easy to pause, resume, or cleanly discard the current match (freeing RAM and references so that leaving does not cause memory leaks).

---

## 3. Mocking and Network (MSW)

- Use MSW at the network level so the whole application "believes" it is connected to a real API.
- We will create arbitrary delays and 500/400 error simulations directly in the MSW handlers, so that TanStack Query can trigger its fallback/retry strategies without "dirty" code scattered across components.

---

## 4. Comments and Variables

- Following the global convention, variables and comments are all written in English.
