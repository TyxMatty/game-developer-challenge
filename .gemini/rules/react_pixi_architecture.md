# React + PixiJS Architecture Rules

- **Canvas Ownership:** NEVER pass a React <canvas> directly to PixiJS pp.init(). ALWAYS let PixiJS generate its own canvas and ppendChild it into a React <div> container.
- **Cleanup:** Always use pp.destroy({ removeView: true }) inside a try-catch block during the React useEffect cleanup.
- **Game Loop Separation:** The Simulation class (TypeScript pure logic) must remain completely independent of the Renderer (PixiJS). The Renderer only reads from the Simulation.

# Pirate Battle Business Rules (from README.md)
- **Player:** Moves forward, rotates left/right. Frontal shot (1 projectile). Lateral shot (3 projectiles). Restricted to arena.
- **Enemies:** 
  - Chaser: chases player, explodes on collision.
  - Shooter: approaches and shoots.
- **Arena:** Must contain water and at least ONE island that blocks ships and projectiles.
