# Graph Report - game-developer-challenge  (2026-10-07)

## Corpus Check
- Large corpus: 538 files Â· ~952,433 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 126 nodes · 157 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Game Rendering
- App TSConfig
- Package Config
- Node TSConfig
- React App Setup
- Dev Dependencies
- Dependencies
- Linter Config
- PixiJS Game Logic
- NPM Scripts
- Root TSConfig

## God Nodes (most connected - your core abstractions)
1. `Simulation` - 18 edges
2. `compilerOptions` - 18 edges
3. `compilerOptions` - 15 edges
4. `GameCanvas()` - 11 edges
5. `Renderer` - 9 edges
6. `scripts` - 5 edges
7. `react` - 5 edges
8. `rules` - 3 edges
9. `App()` - 3 edges
10. `HUD()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `GameCanvas()`  [EXTRACTED]
  src/App.tsx → src/components/GameCanvas.tsx
- `GameCanvas()` --calls--> `HUD()`  [EXTRACTED]
  src/components/GameCanvas.tsx → src/components/HUD.tsx
- `GameCanvas()` --calls--> `Renderer`  [EXTRACTED]
  src/components/GameCanvas.tsx → src/game/Renderer.ts
- `GameCanvas()` --calls--> `Simulation`  [EXTRACTED]
  src/components/GameCanvas.tsx → src/game/Simulation.ts
- `Renderer` --references--> `Simulation`  [EXTRACTED]
  src/game/Renderer.ts → src/game/Simulation.ts

## Import Cycles
- None detected.

## Communities (11 total, 1 thin omitted)

### Community 0 - "Game Rendering"
Cohesion: 0.19
Nodes (3): GameCanvas(), Renderer, Simulation

### Community 1 - "App TSConfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 2 - "Package Config"
Cohesion: 0.12
Nodes (16): name, private, type, version, axios, msw, oxlint, @playwright/test (+8 more)

### Community 3 - "Node TSConfig"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 4 - "React App Setup"
Cohesion: 0.20
Nodes (9): react, react-dom, App(), btnStyle, GameState, overlayStyle, GameProps, HUD() (+1 more)

### Community 5 - "Dev Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, oxlint, @playwright/test, @types/node, @types/react, @types/react-dom, typescript, vite (+1 more)

### Community 6 - "Dependencies"
Cohesion: 0.25
Nodes (8): dependencies, axios, msw, pixi.js, react, react-dom, @tanstack/react-query, zustand

### Community 7 - "Linter Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 8 - "PixiJS Game Logic"
Cohesion: 0.47
Nodes (4): pixi.js, Enemy, Island, Projectile

### Community 9 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Knowledge Gaps
- **78 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+73 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 80 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React App Setup` to `Package Config`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `GameCanvas()` (e.g. with `.destroy()` and `.init()`) actually correct?**
  _`GameCanvas()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App TSConfig` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `Simulation` connect `Game Rendering` to `PixiJS Game Logic`, `React App Setup`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Should `Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Config`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._