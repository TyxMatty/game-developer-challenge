export interface GameConfig {
  sessionTime: number;
  spawnInterval: number;
  player: {
    maxHealth: number;
    speed: number;
    turnSpeed: number;
    damage: number;
    frontCooldown: number;
    sideCooldown: number;
  };
  enemy: {
    chaser: { health: number; speed: number; damage: number; kamikazeRadius: number; };
    shooter: { health: number; speed: number; range: number; cooldown: number; projectileSpeed: number; damage: number; };
  };
  projectiles: {
    speed: number;
    life: number;
  };
}

export const DEFAULT_CONFIG: GameConfig = {
  sessionTime: 60,
  spawnInterval: 3,
  player: {
    maxHealth: 300,
    speed: 200,
    turnSpeed: 2.5,
    damage: 1,
    frontCooldown: 0.5,
    sideCooldown: 1.0,
  },
  enemy: {
    chaser: { health: 2, speed: 120, damage: 10, kamikazeRadius: 40 },
    shooter: { health: 3, speed: 70, range: 250, cooldown: 2.0, projectileSpeed: 200, damage: 5 },
  },
  projectiles: {
    speed: 400,
    life: 2.0,
  }
};

export function loadLocalConfig(): GameConfig {
  let parsed: any = {};
  try {
    const saved = localStorage.getItem('pirate_config');
    if (saved) {
      const data = JSON.parse(saved);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        parsed = data;
      }
    }
  } catch (e) {
    console.warn("Failed to load config", e);
  }

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    player: { ...DEFAULT_CONFIG.player, ...(parsed.player || {}) },
    enemy: {
      ...DEFAULT_CONFIG.enemy,
      ...(parsed.enemy || {}),
      chaser: { ...DEFAULT_CONFIG.enemy.chaser, ...(parsed.enemy?.chaser || {}) },
      shooter: { ...DEFAULT_CONFIG.enemy.shooter, ...(parsed.enemy?.shooter || {}) }
    },
    projectiles: { ...DEFAULT_CONFIG.projectiles, ...(parsed.projectiles || {}) }
  };
}

export function saveLocalConfig(config: GameConfig) {
  try {
    localStorage.setItem('pirate_config', JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to save config", e);
  }
}

