import { type GameConfig, loadLocalConfig } from '../config/GameConfig';
import { type TerminationReason } from '../types/match';

export interface Projectile {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  life: number;
  owner: 'player' | 'enemy';
}

export interface Enemy {
  id: number;
  type: 'chaser' | 'shooter';
  x: number;
  y: number;
  rotation: number;
  health: number;
  speed: number;
  cooldown: number;
}

export interface Island {
  id: number;
  x: number;
  y: number;
  radius: number;
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export class Simulation {
  public config: GameConfig;
  private lastTime: number = 0;
  private animationFrameId: number = 0;
  private readonly manualTestClock: boolean;
  private readonly random: () => number;
  public isRunning: boolean = false;
  public isPaused: boolean = false;

  public sessionTime: number;
  public score: number = 0;
  public onStateChange?: (state: { health: number; maxHealth: number; time: number; score: number }) => void;
  public onGameOver?: (result: { score: number; duration: number; reason: TerminationReason; config: GameConfig }) => void;

  public player: {
    x: number;
    y: number;
    rotation: number;
    speed: number;
    maxSpeed: number;
    turnSpeed: number;
    health: number;
    maxHealth: number;
  };

  public projectiles: Projectile[] = [];
  private nextProjId = 1;

  public enemies: Enemy[] = [];
  private nextEnemyId = 1;
  private spawnedEnemyCount = 0;
  private spawnTimer: number;
  private lastPublishedTime = Number.NaN;
  private lastPublishedHealth = Number.NaN;
  private lastPublishedScore = Number.NaN;

  public islands: Island[] = [];
  private nextIslandId = 1;

  public input = {
    up: false,
    down: false,
    left: false,
    right: false,
    shootFront: false,
    shootLeft: false,
    shootRight: false,
  };

  public cooldowns = { front: 0, left: 0, right: 0 };

  constructor(initialConfig?: GameConfig, testConfig = window.__GAME_TEST_CONFIG__) {
    // Snapshot of active configuration for this match
    this.config = initialConfig ? JSON.parse(JSON.stringify(initialConfig)) : loadLocalConfig();
    this.manualTestClock = testConfig?.manualClock === true;
    this.random = typeof testConfig?.seed === 'number'
      ? createSeededRandom(testConfig.seed)
      : Math.random;
    this.sessionTime = this.config.sessionTime;
    this.spawnTimer = this.config.spawnInterval;

    this.player = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rotation: 0,
      speed: 0,
      maxSpeed: this.config.player.speed,
      turnSpeed: this.config.player.turnSpeed,
      health: this.config.player.maxHealth,
      maxHealth: this.config.player.maxHealth,
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    if (typeof window !== 'undefined') {
      (window as any).__SIMULATION__ = this;
    }
  }

  public pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.clearInputs();
  }

  public resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.clearInputs();
    this.lastTime = performance.now();
  }

  public clearInputs() {
    this.input.up = false;
    this.input.down = false;
    this.input.left = false;
    this.input.right = false;
    this.input.shootFront = false;
    this.input.shootLeft = false;
    this.input.shootRight = false;
  }

  public setInput(key: keyof Simulation['input'], value: boolean) {
    if (!this.isRunning || this.isPaused) return;
    this.input[key] = value;
  }

  public advanceTestTime(deltaMs: number) {
    if (!this.manualTestClock) {
      throw new Error('Manual simulation time is only available in test mode.');
    }
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      throw new RangeError('Test time must be a finite, non-negative number of milliseconds.');
    }
    if (!this.isRunning || this.isPaused) return;

    let remainingMs = deltaMs;
    while (remainingMs > 0 && this.isRunning && !this.isPaused) {
      const stepMs = Math.min(remainingMs, 100);
      this.update(stepMs);
      remainingMs -= stepMs;
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // Only capture keys when active gameplay context is running and not paused
    if (!this.isRunning || this.isPaused) return;
    this.handleKey(e.code, e.key, true);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (!this.isRunning || this.isPaused) return;
    this.handleKey(e.code, e.key, false);
  };

  private handleKey(code: string, key: string, isPressed: boolean) {
    const normalizedCode = (code || '').toLowerCase();
    const normalizedKey = (key || '').toLowerCase();

    const isMoveKey = normalizedCode === 'keyw' || normalizedCode === 'arrowup' || normalizedKey === 'w';
    const isDownKey = normalizedCode === 'keys' || normalizedCode === 'arrowdown' || normalizedKey === 's';
    const isLeftKey = normalizedCode === 'keya' || normalizedCode === 'arrowleft' || normalizedKey === 'a';
    const isRightKey = normalizedCode === 'keyd' || normalizedCode === 'arrowright' || normalizedKey === 'd';
    const isFrontFireKey = normalizedCode === 'space' || normalizedKey === ' ';
    const isLeftFireKey = normalizedCode === 'keyq' || normalizedKey === 'q';
    const isRightFireKey = normalizedCode === 'keye' || normalizedKey === 'e';

    if (isMoveKey) this.input.up = isPressed;
    if (isDownKey) this.input.down = isPressed;
    if (isLeftKey) this.input.left = isPressed;
    if (isRightKey) this.input.right = isPressed;
    if (isFrontFireKey) this.input.shootFront = isPressed;
    if (isLeftFireKey) this.input.shootLeft = isPressed;
    if (isRightFireKey) this.input.shootRight = isPressed;

    if (isPressed && this.isRunning && !this.isPaused) {
      if (isFrontFireKey && this.cooldowns.front <= 0) {
        this.spawnProjectile(this.player.x, this.player.y, this.player.rotation, 'player');
        this.cooldowns.front = this.config.player.frontCooldown;
      }
      if (isLeftFireKey && this.cooldowns.left <= 0) {
        const rot = this.player.rotation - Math.PI / 2;
        this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
        const offX = Math.cos(rot) * 20;
        const offY = Math.sin(rot) * 20;
        this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
        this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
        this.cooldowns.left = this.config.player.sideCooldown;
      }
      if (isRightFireKey && this.cooldowns.right <= 0) {
        const rot = this.player.rotation + Math.PI / 2;
        this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
        const offX = Math.cos(rot) * 20;
        const offY = Math.sin(rot) * 20;
        this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
        this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
        this.cooldowns.right = this.config.player.sideCooldown;
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    // Island generator
    if (this.islands.length === 0) {
      const marginX = Math.min(100, window.innerWidth / 4);
      const marginY = Math.min(100, window.innerHeight / 4);
      const candidates = [
        { x: marginX, y: marginY },
        { x: window.innerWidth - marginX, y: marginY },
        { x: marginX, y: window.innerHeight - marginY },
        { x: window.innerWidth - marginX, y: window.innerHeight - marginY },
      ].sort((a, b) => (
        Math.hypot(b.x - this.player.x, b.y - this.player.y)
        - Math.hypot(a.x - this.player.x, a.y - this.player.y)
      ));
      const minimumIslandDistance = Math.min(
        200,
        Math.hypot(window.innerWidth / 2 - marginX, window.innerHeight / 2 - marginY) * 0.75,
      );

      let generatedIslandCount = 0;
      for (const candidate of candidates) {
        if (Math.hypot(candidate.x - this.player.x, candidate.y - this.player.y) <= minimumIslandDistance) continue;
        if (this.islands.some(island => Math.hypot(candidate.x - island.x, candidate.y - island.y) < 180)) continue;
        this.islands.push({ id: this.nextIslandId++, ...candidate, radius: 70 });
        generatedIslandCount++;
        if (generatedIslandCount === 3) break;
      }
    }

    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  destroy() {
    this.stop();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.clearInputs();
    this.enemies.length = 0;
    this.projectiles.length = 0;
    this.islands.length = 0;
    if ((window as any).__SIMULATION__ === this) {
      delete (window as any).__SIMULATION__;
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    if (this.manualTestClock) {
      this.lastTime = time;
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    if (this.isPaused) {
      this.lastTime = time;
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    const deltaMs = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaMs);
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private spawnProjectile(x: number, y: number, rotation: number, owner: 'player' | 'enemy') {
    let speed = this.config.projectiles.speed;
    if (owner === 'enemy') {
      speed = this.config.enemy.shooter.projectileSpeed;
    }
    this.projectiles.push({
      id: this.nextProjId++,
      x,
      y,
      rotation,
      speed,
      life: this.config.projectiles.life,
      owner,
    });
  }

  private spawnEnemy() {
    const minX = 30;
    const maxX = window.innerWidth - 30;
    const minY = 30;
    const maxY = window.innerHeight - 30;
    if (maxX <= minX || maxY <= minY) return;

    const farthestCornerDistance = Math.max(
      Math.hypot(this.player.x - minX, this.player.y - minY),
      Math.hypot(this.player.x - maxX, this.player.y - minY),
      Math.hypot(this.player.x - minX, this.player.y - maxY),
      Math.hypot(this.player.x - maxX, this.player.y - maxY),
    );
    const minimumDistance = Math.min(500, farthestCornerDistance * 0.75);
    let spawnPoint: { x: number; y: number } | null = null;

    for (let attempt = 0; attempt < 80; attempt++) {
      const candidate = {
        x: minX + this.random() * (maxX - minX),
        y: minY + this.random() * (maxY - minY),
      };
      if (Math.hypot(candidate.x - this.player.x, candidate.y - this.player.y) < minimumDistance) continue;
      if (this.islands.some(island => Math.hypot(candidate.x - island.x, candidate.y - island.y) < island.radius + 30)) continue;
      spawnPoint = candidate;
      break;
    }
    if (!spawnPoint) return;

    const chaserRatio = Math.max(0, this.config.spawnDistribution?.chaserRatio ?? 0.5);
    const shooterRatio = Math.max(0, this.config.spawnDistribution?.shooterRatio ?? 0.5);
    const totalRatio = chaserRatio + shooterRatio;
    const chaserChance = totalRatio > 0 ? chaserRatio / totalRatio : 0.5;
    const bothTypesConfigured = chaserRatio > 0 && shooterRatio > 0;
    const guaranteedOpeningType = bothTypesConfigured && this.spawnedEnemyCount < 2
      ? (this.spawnedEnemyCount === 0 ? 'chaser' : 'shooter')
      : null;
    const type: 'chaser' | 'shooter' = guaranteedOpeningType
      ?? (this.random() < chaserChance ? 'chaser' : 'shooter');
    const enemyConfig = this.config.enemy[type];

    this.enemies.push({
      id: this.nextEnemyId++,
      type,
      x: spawnPoint.x,
      y: spawnPoint.y,
      rotation: 0,
      health: enemyConfig.health,
      speed: enemyConfig.speed,
      cooldown: 0,
    });
    this.spawnedEnemyCount++;
  }

  private resolvePhysics() {
    const ships = [this.player, ...this.enemies];

    // Ship vs Ship collision
    for (let i = 0; i < ships.length; i++) {
      const shipA = ships[i];
      for (let j = i + 1; j < ships.length; j++) {
        const shipB = ships[j];
        const dist = Math.hypot(shipA.x - shipB.x, shipA.y - shipB.y);
        const minDist = 40;

        if (dist > 0 && dist < minDist) {
          const overlap = minDist - dist;
          const nx = (shipA.x - shipB.x) / dist;
          const ny = (shipA.y - shipB.y) / dist;

          shipA.x += nx * (overlap / 2);
          shipA.y += ny * (overlap / 2);
          shipB.x -= nx * (overlap / 2);
          shipB.y -= ny * (overlap / 2);
        }
      }
    }

    // Arena walls and islands
    for (let i = 0; i < ships.length; i++) {
      const shipA = ships[i];

      shipA.x = Math.max(30, Math.min(window.innerWidth - 30, shipA.x));
      shipA.y = Math.max(30, Math.min(window.innerHeight - 30, shipA.y));

      for (const island of this.islands) {
        const dist = Math.hypot(shipA.x - island.x, shipA.y - island.y);
        const minDist = island.radius + 20;

        if (dist > 0 && dist < minDist) {
          const overlap = minDist - dist;
          shipA.x += ((shipA.x - island.x) / dist) * overlap;
          shipA.y += ((shipA.y - island.y) / dist) * overlap;
        }
      }

      shipA.x = Math.max(30, Math.min(window.innerWidth - 30, shipA.x));
      shipA.y = Math.max(30, Math.min(window.innerHeight - 30, shipA.y));
    }
  }

  private update(deltaMs: number) {
    const dt = Math.max(0, Math.min(deltaMs / 1000, 0.1));

    this.sessionTime -= dt;
    if (this.sessionTime <= 0 || this.player.health <= 0) {
      this.sessionTime = Math.max(0, this.sessionTime);
      this.isRunning = false;

      const effectiveDuration = Math.round((this.config.sessionTime - this.sessionTime) * 10) / 10;
      const reason: TerminationReason = this.player.health <= 0 ? 'defeat' : 'time_out';

      if (this.onGameOver) {
        this.onGameOver({
          score: this.score,
          duration: Math.max(1, effectiveDuration),
          reason,
          config: this.config,
        });
      }
    }

    const displayedTime = Math.floor(this.sessionTime);
    const displayedHealth = Math.ceil(Math.max(0, this.player.health));
    if (this.onStateChange && (
      displayedTime !== this.lastPublishedTime ||
      displayedHealth !== this.lastPublishedHealth ||
      this.score !== this.lastPublishedScore
    )) {
      this.lastPublishedTime = displayedTime;
      this.lastPublishedHealth = displayedHealth;
      this.lastPublishedScore = this.score;
      this.onStateChange({
        health: displayedHealth,
        maxHealth: this.player.maxHealth,
        time: this.sessionTime,
        score: this.score,
      });
    }

    if (!this.isRunning) return;

    // ---- PLAYER MOVEMENT & ROTATION ----
    if (this.input.left) this.player.rotation -= this.player.turnSpeed * dt;
    if (this.input.right) this.player.rotation += this.player.turnSpeed * dt;

    let thrust = 0;
    if (this.input.up) thrust = 1;
    if (this.input.down) thrust = -0.5;

    this.player.speed = thrust * this.player.maxSpeed;
    this.player.x += Math.sin(this.player.rotation) * this.player.speed * dt;
    this.player.y -= Math.cos(this.player.rotation) * this.player.speed * dt;

    // ---- COOLDOWNS ----
    if (this.cooldowns.front > 0) this.cooldowns.front -= dt;
    if (this.cooldowns.left > 0) this.cooldowns.left -= dt;
    if (this.cooldowns.right > 0) this.cooldowns.right -= dt;

    if (this.input.shootFront && this.cooldowns.front <= 0) {
      this.spawnProjectile(this.player.x, this.player.y, this.player.rotation, 'player');
      this.cooldowns.front = this.config.player.frontCooldown;
    }
    if (this.input.shootLeft && this.cooldowns.left <= 0) {
      const rot = this.player.rotation - Math.PI / 2;
      this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
      const offX = Math.cos(rot) * 20;
      const offY = Math.sin(rot) * 20;
      this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
      this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
      this.cooldowns.left = this.config.player.sideCooldown;
    }
    if (this.input.shootRight && this.cooldowns.right <= 0) {
      const rot = this.player.rotation + Math.PI / 2;
      this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
      const offX = Math.cos(rot) * 20;
      const offY = Math.sin(rot) * 20;
      this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
      this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
      this.cooldowns.right = this.config.player.sideCooldown;
    }

    // ---- ENEMIES (AI & SPAWN) ----
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < 50) {
      this.spawnEnemy();
      this.spawnTimer = this.config.spawnInterval;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const distance = Math.hypot(dx, dy);

      e.rotation = Math.atan2(dx, -dy);

      if (e.type === 'chaser') {
        e.x += Math.sin(e.rotation) * e.speed * dt;
        e.y -= Math.cos(e.rotation) * e.speed * dt;

        const kamikazeDist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
        if (kamikazeDist < this.config.enemy.chaser.kamikazeRadius) {
          this.player.health -= this.config.enemy.chaser.damage;
          this.enemies.splice(i, 1);
          continue;
        }
      } else if (e.type === 'shooter') {
        const range = this.config.enemy.shooter.range;
        if (distance > range) {
          e.x += Math.sin(e.rotation) * e.speed * dt;
          e.y -= Math.cos(e.rotation) * e.speed * dt;
        }
        e.cooldown -= dt;
        if (distance <= range && e.cooldown <= 0) {
          this.spawnProjectile(e.x, e.y, e.rotation, 'enemy');
          e.cooldown = this.config.enemy.shooter.cooldown;
        }
      }
    }

    this.resolvePhysics();

    // ---- PROJECTILES & DAMAGE ----
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      p.x += Math.sin(p.rotation) * p.speed * dt;
      p.y -= Math.cos(p.rotation) * p.speed * dt;

      if (p.x < 0 || p.x > window.innerWidth || p.y < 0 || p.y > window.innerHeight) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Cannonball hitting island
      let hitIsland = false;
      for (const island of this.islands) {
        if (Math.hypot(p.x - island.x, p.y - island.y) < island.radius) {
          hitIsland = true;
          break;
        }
      }
      if (hitIsland) {
        this.projectiles.splice(i, 1);
        continue;
      }

      let hit = false;
      if (p.owner === 'player') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (Math.hypot(p.x - e.x, p.y - e.y) < 30) {
            e.health -= this.config.player.damage;
            hit = true;
            if (e.health <= 0) {
              this.enemies.splice(j, 1);
              this.score += 1;
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 30) {
          this.player.health -= this.config.enemy.shooter.damage;
          hit = true;
        }
      }

      if (hit) {
        this.projectiles.splice(i, 1);
      }
    }
  }
}