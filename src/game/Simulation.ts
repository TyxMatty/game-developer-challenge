export interface Projectile {
  id: number; x: number; y: number; rotation: number; speed: number; life: number; owner: 'player' | 'enemy';
}
export interface Enemy {
  id: number; type: 'chaser' | 'shooter'; x: number; y: number; rotation: number; health: number; speed: number; cooldown: number;
}
export interface Island {
  id: number; x: number; y: number; radius: number;
}

export class Simulation {
  private lastTime: number = 0;
  private animationFrameId: number = 0;
  private isRunning: boolean = false;

  public player = {
    x: window.innerWidth / 2, y: window.innerHeight / 2, rotation: 0, speed: 0, maxSpeed: 200, turnSpeed: 2.5, health: 100,
  };

  public projectiles: Projectile[] = [];
  private nextProjId = 1;

  public enemies: Enemy[] = [];
  private nextEnemyId = 1;
  private spawnTimer = 0; 

  public islands: Island[] = []; // Ilhas
  private nextIslandId = 1;

  public input = {
    up: false, down: false, left: false, right: false, shootFront: false, shootLeft: false, shootRight: false,
  };

  public cooldowns = { front: 0, left: 0, right: 0 };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => this.handleKey(e.code, true);
  private onKeyUp = (e: KeyboardEvent) => this.handleKey(e.code, false);

  private handleKey(code: string, isPressed: boolean) {
    if (code === 'KeyW' || code === 'ArrowUp') this.input.up = isPressed;
    if (code === 'KeyS' || code === 'ArrowDown') this.input.down = isPressed;
    if (code === 'KeyA' || code === 'ArrowLeft') this.input.left = isPressed;
    if (code === 'KeyD' || code === 'ArrowRight') this.input.right = isPressed;
    if (code === 'Space') this.input.shootFront = isPressed;
    if (code === 'KeyQ') this.input.shootLeft = isPressed;
    if (code === 'KeyE') this.input.shootRight = isPressed;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    
    // AQUI: Gerador de Ilhas (Só roda 1 vez)
    if (this.islands.length === 0) {
      while (this.islands.length < 3) {
        const ix = 100 + Math.random() * (window.innerWidth - 200);
        const iy = 100 + Math.random() * (window.innerHeight - 200);
        // Garante que a ilha não vai nascer em cima do jogador
        if (Math.hypot(ix - this.player.x, iy - this.player.y) > 200) {
          this.islands.push({ id: this.nextIslandId++, x: ix, y: iy, radius: 70 });
        }
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
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;
    const deltaMs = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaMs);
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private spawnProjectile(x: number, y: number, rotation: number, owner: 'player'|'enemy') {
    this.projectiles.push({ id: this.nextProjId++, x, y, rotation, speed: 400, life: 2.0, owner });
  }

  private spawnEnemy() {
    let ex = 0, ey = 0;
    let validSpawn = false;

    // AQUI: Loop para garantir que o inimigo não nasça dentro de uma ilha
    while (!validSpawn) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 500 + Math.random() * 300; 
      ex = this.player.x + Math.cos(angle) * distance;
      ey = this.player.y + Math.sin(angle) * distance;
      
      // Prende na tela
      ex = Math.max(30, Math.min(window.innerWidth - 30, ex));
      ey = Math.max(30, Math.min(window.innerHeight - 30, ey));

      validSpawn = true;
      for (const island of this.islands) {
        if (Math.hypot(ex - island.x, ey - island.y) < island.radius + 30) {
          validSpawn = false;
        }
      }
    }

    const type = Math.random() > 0.5 ? 'chaser' : 'shooter';
    this.enemies.push({
      id: this.nextEnemyId++, type, x: ex, y: ey, rotation: 0,
      health: type === 'chaser' ? 2 : 3, 
      speed: type === 'chaser' ? 140 : 80, 
      cooldown: 0
    });
  }

  // Colisão de Navios (Jogador ou Inimigos)
  private resolvePhysics() {
    // Agrupa o jogador e os inimigos numa mesma lista para facilitar
    const ships = [this.player, ...this.enemies];

    for (let i = 0; i < ships.length; i++) {
      const shipA = ships[i];
      
      // 1. Bater nas paredes invisíveis da arena
      shipA.x = Math.max(30, Math.min(window.innerWidth - 30, shipA.x));
      shipA.y = Math.max(30, Math.min(window.innerHeight - 30, shipA.y));

      // 2. Bater e deslizar nas Ilhas
      for (const island of this.islands) {
        const dist = Math.hypot(shipA.x - island.x, shipA.y - island.y);
        const minDist = island.radius + 20; // Raio da ilha + Raio do Barco (20)
        
        if (dist > 0 && dist < minDist) {
          const overlap = minDist - dist;
          shipA.x += ((shipA.x - island.x) / dist) * overlap;
          shipA.y += ((shipA.y - island.y) / dist) * overlap;
        }
      }

      // 3. Colisão Corpo-a-Corpo (Navio contra Navio)
      for (let j = i + 1; j < ships.length; j++) {
        const shipB = ships[j];
        const dist = Math.hypot(shipA.x - shipB.x, shipA.y - shipB.y);
        const minDist = 40; // 20 (raio A) + 20 (raio B)
        
        if (dist > 0 && dist < minDist) {
          const overlap = minDist - dist;
          const nx = (shipA.x - shipB.x) / dist;
          const ny = (shipA.y - shipB.y) / dist;
          
          // Empurra os dois em direções opostas dividindo o impacto!
          shipA.x += nx * (overlap / 2);
          shipA.y += ny * (overlap / 2);
          shipB.x -= nx * (overlap / 2);
          shipB.y -= ny * (overlap / 2);
        }
      }
    }
  }

    private update(deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.1); 

    // ---- JOGADOR ----
    if (this.input.left) this.player.rotation -= this.player.turnSpeed * dt;
    if (this.input.right) this.player.rotation += this.player.turnSpeed * dt;
    let thrust = 0;
    if (this.input.up) thrust = 1;
    if (this.input.down) thrust = -0.5;
    this.player.speed = thrust * this.player.maxSpeed;
    this.player.x += Math.sin(this.player.rotation) * this.player.speed * dt;
    this.player.y -= Math.cos(this.player.rotation) * this.player.speed * dt;

    if (this.cooldowns.front > 0) this.cooldowns.front -= dt;
    if (this.cooldowns.left > 0) this.cooldowns.left -= dt;
    if (this.cooldowns.right > 0) this.cooldowns.right -= dt;

    if (this.input.shootFront && this.cooldowns.front <= 0) {
      this.spawnProjectile(this.player.x, this.player.y, this.player.rotation, 'player');
      this.cooldowns.front = 0.5; 
    }
    if (this.input.shootLeft && this.cooldowns.left <= 0) {
      const rot = this.player.rotation - (Math.PI / 2); 
      this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
      const offX = Math.cos(rot) * 20; const offY = Math.sin(rot) * 20;
      this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
      this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
      this.cooldowns.left = 1.0; 
    }
    if (this.input.shootRight && this.cooldowns.right <= 0) {
      const rot = this.player.rotation + (Math.PI / 2); 
      this.spawnProjectile(this.player.x, this.player.y, rot, 'player');
      const offX = Math.cos(rot) * 20; const offY = Math.sin(rot) * 20;
      this.spawnProjectile(this.player.x + offX, this.player.y + offY, rot, 'player');
      this.spawnProjectile(this.player.x - offX, this.player.y - offY, rot, 'player');
      this.cooldowns.right = 1.0; 
    }

    // ---- INIMIGOS (IA e Spawn) ----
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      this.spawnTimer = 4.0; 
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
        
        // Colisão direta e morte do Kamikaze (Antes da física!)
        const kamikazeDist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
        if (kamikazeDist < 40) {
          this.player.health -= 10;
          this.enemies.splice(i, 1);
          console.log("Tomou dano de Chaser! Vida:", this.player.health);
          continue; // Como ele explodiu, pulamos a física pra ele.
        }
      } else if (e.type === 'shooter') {
        if (distance > 250) {
          e.x += Math.sin(e.rotation) * e.speed * dt;
          e.y -= Math.cos(e.rotation) * e.speed * dt;
        }
        e.cooldown -= dt;
        if (distance < 350 && e.cooldown <= 0) {
          this.spawnProjectile(e.x, e.y, e.rotation, 'enemy');
          e.cooldown = 2.0; 
        }
      }
    }

    // uma unica vez por frame, para evitar múltiplas resoluções de física no mesmo frame.
    this.resolvePhysics();

    // ---- PROJÉTEIS & COLISÕES ----
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      p.x += Math.sin(p.rotation) * p.speed * dt;
      p.y -= Math.cos(p.rotation) * p.speed * dt;

      // Colisão da Bala contra a Ilha
      let hitIsland = false;
      for (const island of this.islands) {
        if (Math.hypot(p.x - island.x, p.y - island.y) < island.radius) {
          hitIsland = true; break;
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
            e.health -= 1;
            hit = true;
            if (e.health <= 0) {
              this.enemies.splice(j, 1); 
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 30) {
          this.player.health -= 5;
          hit = true;
          console.log("Bala do inimigo acertou! Vida:", this.player.health);
        }
      }

      if (hit) {
        this.projectiles.splice(i, 1);
      }
    }
  }
}