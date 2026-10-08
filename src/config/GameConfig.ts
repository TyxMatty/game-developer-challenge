// Game configuration interface and default values for the game, all of which can be customized(as specified by the challenge)
export interface GameConfig {
  sessionTime: number; // in seconds
  spawnInterval: number; // in seconds
  spawnDistribution: {
    chaserRatio: number;
    shooterRatio: number;
  };
  player: {
    maxHealth: number;
    speed: number;
    turnSpeed: number;
    damage: number;
    frontCooldown: number;
    sideCooldown: number;
  };
  enemy: {
    chaser: {
      health: number;
      speed: number;
      damage: number;
      kamikazeRadius: number;
    };
    shooter: {
      health: number;
      speed: number;
      range: number;
      cooldown: number;
      projectileSpeed: number;
      damage: number;
    };
  };
  projectiles: {
    speed: number;
    life: number;
  };
}

export const CONFIG_LIMITS = {
  sessionTime: {
    min: 60,
    max: 180,
    step: 15,
    default: 60,
    unit: 'seconds',
    description: 'Total duration of a combat match (60s to 180s).'
  },
  spawnInterval: {
    min: 1.0,
    max: 10.0,
    step: 0.5,
    default: 3.0,
    unit: 'seconds',
    description: 'Delay between consecutive enemy spawns (1.0s to 10.0s).'
  }
} as const;

export const DEFAULT_CONFIG: GameConfig = { // Default game configuration values, normally you cant change these directly, only with Dev Tools
  sessionTime: 60,
  spawnInterval: 3.0,
  spawnDistribution: {
    chaserRatio: 0.5,
    shooterRatio: 0.5,
  },
  player: {
    maxHealth: 300,
    speed: 200,
    turnSpeed: 2.5,
    damage: 1,
    frontCooldown: 0.5,
    sideCooldown: 1.0,
  },
  enemy: {
    chaser: {
      health: 2,
      speed: 120,
      damage: 10,
      kamikazeRadius: 40,
    },
    shooter: {
      health: 3,
      speed: 70,
      range: 250,
      cooldown: 2.0,
      projectileSpeed: 200,
      damage: 5,
    },
  },
  projectiles: {
    speed: 400,
    life: 2.0,
  },
};

const STORAGE_KEY = 'pirate_battle_config';

export function loadLocalConfig(): GameConfig {
  let parsed: any = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        parsed = data;
      }
    }
  } catch (e) {
    console.warn('Failed to load local config:', e);
  }

  // Validate limits on user-configurable options
  const sessionTime = typeof parsed.sessionTime === 'number'
    ? Math.max(CONFIG_LIMITS.sessionTime.min, Math.min(CONFIG_LIMITS.sessionTime.max, parsed.sessionTime))
    : DEFAULT_CONFIG.sessionTime;

  const spawnInterval = typeof parsed.spawnInterval === 'number'
    ? Math.max(CONFIG_LIMITS.spawnInterval.min, Math.min(CONFIG_LIMITS.spawnInterval.max, parsed.spawnInterval))
    : DEFAULT_CONFIG.spawnInterval;

  return {
    ...DEFAULT_CONFIG,
    sessionTime,
    spawnInterval,
    spawnDistribution: {
      ...DEFAULT_CONFIG.spawnDistribution,
      ...(parsed.spawnDistribution || {}),
    },
    player: {
      ...DEFAULT_CONFIG.player,
      ...(parsed.player || {}),
      maxHealth: 300, // Keep player health consistent
    },
    enemy: {
      ...DEFAULT_CONFIG.enemy,
      chaser: { ...DEFAULT_CONFIG.enemy.chaser, ...(parsed.enemy?.chaser || {}) },
      shooter: { ...DEFAULT_CONFIG.enemy.shooter, ...(parsed.enemy?.shooter || {}) },
    },
    projectiles: {
      ...DEFAULT_CONFIG.projectiles,
      ...(parsed.projectiles || {}),
    },
  };
}

export function saveLocalConfig(config: Partial<GameConfig>): GameConfig {
  const current = loadLocalConfig();
  const updated: GameConfig = {
    ...current,
    ...config,
    player: { ...current.player, ...(config.player || {}) },
    enemy: {
      chaser: { ...current.enemy.chaser, ...(config.enemy?.chaser || {}) },
      shooter: { ...current.enemy.shooter, ...(config.enemy?.shooter || {}) },
    },
    projectiles: { ...current.projectiles, ...(config.projectiles || {}) },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save local config:', e);
  }

  return updated;
}
