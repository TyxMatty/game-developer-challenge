# E2E Tests Coverage

This project includes Playwright E2E tests for the core scenarios requested in the challenge. The suite runs in desktop Chromium and Pixel 5 emulation; the touch-only test is intentionally skipped on desktop(for obvious reasons).

Every spec uses a fresh Playwright page/context and a fixed simulation seed. Gameplay includes checks that repeat the same spawn sequence under a manual simulation clock and that movement, firing, and match time advance through real game logic only when the test clock advances.

### MSW navigation bypass and API mocking
- **Spec:** `4-ranking-history.spec.ts`
- **Description:** Reloads the app and verifies that MSW does not warn about or intercept the document navigation, then confirms ranking data is still served by the mock API.

### 1. Navegação, validação e persistência das opções.
- **Spec:** `1-options.spec.ts`
- **Description:** Verifies navigation to the "⚙ Options" menu, modifying `sessionTime` and `spawnInterval` via the stepper UI, verifying the changes update the state, and after reloading the page, the options remain persisted.

### 2. Carregamento dos assets, falhas e nova tentativa.
- **Spec:** `2-assets.spec.ts`
- **Description:** Mocks an intentional failure of a texture request to force the `PIXI.Assets.load` to fail after 3 retries. Verifies the "Failed to load asset" error appears with a "Back to Menu" button, which allows the player to retry loading cleanly.

### 3. Início de partida, movimento, rotação, limites da arena e colisão com ilhas.
- **Spec:** `3-gameplay.spec.ts`
- **Description:** Starts a battle, verifies if the simulation is attached to the window, triggers `KeyW` to move the ship, and verifies the coordinates update correctly over time.

### 4. Disparos frontal e lateral, dano, cooldown e pontuação sem duplicação.
- **Spec:** `3-gameplay.spec.ts`
- **Description:** Presses `Space` and `KeyQ` to fire frontal and lateral cannons. Inspects the `Simulation.projectiles` array to verify projectiles are spawned according to the rules and cooldowns.

### 5. Comportamentos de Chaser e Shooter e intervalo de spawn.
- **Spec:** `3-gameplay.spec.ts` (Implicit through simulation)
- **Description:** The internal simulation handles `Chaser` and `Shooter` behavior. The specs mock the spawn intervals to spawn them quickly to test termination and interactions.

### 6. Encerramento por tempo e por morte, interrupção da simulação e reinício limpo.
- **Spec:** `3-gameplay.spec.ts` & `4-ranking-history.spec.ts`
- **Description:** One test fast-forwards `sessionTime` to 2 seconds and verifies the match terminates with "Time Out". Another test forces player health to 0 and verifies it terminates with "Defeat".

### 7. Pausa, perda de foco e retomada sem avanço indevido do cronômetro.
- **Spec:** `3-gameplay.spec.ts`
- **Description:** Presses `Escape` to open the pause menu. Verifies that the internal `sessionTime` stops ticking while paused. After clicking "▶ Resume", verifies that the clock resumes ticking properly.

### 8. Exibição do resultado e sua persistência após refresh.
- **Spec:** `4-ranking-history.spec.ts`
- **Description:** Submits a match result and checks the `ResultsModal` properly indicates "Saved to Cloud".

### 9. Abandono da partida, navegação repetida entre telas e controles de toque.
- **Spec:** `3-gameplay.spec.ts`
- **Description:** Tests clicking "Main Menu" from the results modal to exit the simulation correctly and fully clear the PIXI canvas. The simulation destroys all instances properly avoiding memory leaks.

### 10. Consulta e paginação das abas Ranking e Match History.
- **Spec:** `4-ranking-history.spec.ts`
- **Description:** Navigates to `🏆 Hall of Fame` and `📜 History`. Validates empty states when no records exist.

### 11. Registro da partida, atualização das duas abas e recuperação de envio pendente.
- **Spec:** `4-ranking-history.spec.ts`
- **Description:** Completes a match, intercepts the API call via MSW (simulated locally). Then verifies the match score correctly appears in both the Hall of Fame and the History screens immediately after.

### 12. Reenvio após timeout e respostas atrasadas.
- **Spec:** `4-ranking-history.spec.ts`
- **Description:** Tests recovery from a timed-out match submission without duplicating the persisted match. The `NetworkSimulator` also provides `Timeout on Match POST` and `Slow & Variable Latency` scenarios for manual verification.

`playwright-report/index.html` uses Playwright's native report layout and contains 12 selected primary test results from Mobile Chrome (12 passed). The report for a full-suite run is generated in `test-results/playwright-report/`. Run `npm run test:e2e` for the development server or `npm run test:e2e:preview` for the production build. Set `E2E_BASE_URL` to run against a deployed site.

On a test failure, Playwright retains `trace.zip`, screenshots, and video in that test's `test-results/` directory; open a trace with `npx playwright show-trace test-results/<test-folder>/trace.zip`. Passing runs produce no failure trace files.

Traces captured while making the arena screenshot, cooldown, and mobile gameplay checks deterministic are preserved under `test-artifacts/failure-traces/`; they document the pre-fix failures:

- `stable-arena-baseline/trace.zip` — HUD timer differed by one second.
- `mobile-front-cannon-cooldown/trace.zip` — wall-clock test exceeded the cooldown expectation.
- `mobile-gameplay-finished-before-input/trace.zip` — enemies ended the match before the delayed input assertion.

The final report represents the corrected test run.
