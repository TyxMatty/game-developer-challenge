import * as PIXI from 'pixi.js';
import { Simulation } from './Simulation';

interface Explosion {
  x: number; y: number; age: number; sprite: PIXI.Sprite;
}

export class Renderer {
  public app: PIXI.Application;
  private simulation: Simulation;
  
  private playerContainer!: PIXI.Container; 
  private playerSprite!: PIXI.Sprite;
  
  private projectileSprites: Map<number, PIXI.Graphics> = new Map();
  private enemyContainers: Map<number, PIXI.Container> = new Map(); 
  
  private islandSprites: PIXI.Graphics[] = [];

  private texChaser!: PIXI.Texture;
  private texShooter!: PIXI.Texture;
  private texEnemyHpFrame!: PIXI.Texture;
  private texEnemyHpFill!: PIXI.Texture;
  private texPlayerHpFill!: PIXI.Texture;
  
  private texExplosions: PIXI.Texture[] = [];
  private activeExplosions: Explosion[] = [];

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.app = new PIXI.Application();
  }

  async init(container: HTMLDivElement, onProgress?: (progress: number) => void) {
    onProgress?.(0.1);
    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x1099bb, 
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    onProgress?.(0.2);

    container.appendChild(this.app.canvas);

    const assetUrls = [
      '/assets/png/retina/tiles/tile_73.png',
      '/assets/png/default/ships/ship_1.png',
      '/assets/png/default/ships/ship_3.png',
      '/assets/png/default/ships/ship_5.png',
      '/assets/png/default/ui/hud/enemy_health_frame.png',
      '/assets/png/default/ui/hud/enemy_health_fill_red.png',
      '/assets/png/default/ui/hud/enemy_health_fill_green.png',
      '/assets/png/default/effects/explosion_1.png',
      '/assets/png/default/effects/explosion_2.png',
      '/assets/png/default/effects/explosion_3.png',
    ];

    let loaded = 0;
    const stepLoad = async (url: string) => {
      const tex = await PIXI.Assets.load(url);
      loaded++;
      onProgress?.(0.2 + (loaded / assetUrls.length) * 0.8);
      return tex;
    };

    const waterTexture = await stepLoad(assetUrls[0]);
    const waterBg = new PIXI.TilingSprite({
      texture: waterTexture,
      width: this.app.screen.width,
      height: this.app.screen.height
    });
    this.app.stage.addChild(waterBg);
    
    // Resize background when window resizes
    this.app.renderer.on('resize', () => {
      waterBg.width = this.app.screen.width;
      waterBg.height = this.app.screen.height;
    });

    const shipTexture = await stepLoad(assetUrls[1]);
    this.texChaser = await stepLoad(assetUrls[2]);
    this.texShooter = await stepLoad(assetUrls[3]);
    this.texEnemyHpFrame = await stepLoad(assetUrls[4]);
    this.texEnemyHpFill = await stepLoad(assetUrls[5]);
    this.texPlayerHpFill = await stepLoad(assetUrls[6]);
    
    this.texExplosions.push(await stepLoad(assetUrls[7]));
    this.texExplosions.push(await stepLoad(assetUrls[8]));
    this.texExplosions.push(await stepLoad(assetUrls[9]));

    this.playerContainer = new PIXI.Container();
    this.playerSprite = new PIXI.Sprite(shipTexture);
    this.playerSprite.anchor.set(0.5); 
    this.playerContainer.addChild(this.playerSprite);
    
    const hpContainer = new PIXI.Container();
    hpContainer.label = 'hp_container';
    hpContainer.y = -50;
    hpContainer.scale.set(0.5);
    this.playerContainer.addChild(hpContainer);

    const hpFrame = new PIXI.Sprite(this.texEnemyHpFrame);
    hpFrame.anchor.set(0.5);
    hpContainer.addChild(hpFrame);
    
    const hpFill = new PIXI.Sprite(this.texPlayerHpFill);
    hpFill.label = 'hp_fill';
    hpFill.anchor.set(0.5);
    hpContainer.addChild(hpFill);

    const mask = new PIXI.Graphics();
    mask.label = 'hp_mask';
    hpFill.mask = mask;
    hpContainer.addChild(mask);

    this.app.stage.addChild(this.playerContainer);
    this.app.ticker.add(this.render);
  }
  
  private spawnExplosion(x: number, y: number) {
    const sprite = new PIXI.Sprite(this.texExplosions[0]);
    sprite.anchor.set(0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.rotation = Math.random() * Math.PI * 2;
    sprite.scale.set(0.8 + Math.random() * 0.4);
    this.app.stage.addChild(sprite);
    this.activeExplosions.push({ x, y, age: 0, sprite });
  }

  private createProjectileSprite(): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 5); 
    graphics.fill({ color: 0x222222 }); 
    graphics.circle(-2, -2, 2);
    graphics.fill({ color: 0x888888 }); 
    return graphics;
  }

  private render = (ticker: PIXI.Ticker) => {
    // 0. Sincroniza Ilhas
    if (this.islandSprites.length !== this.simulation.islands.length) {
      for (const g of this.islandSprites) this.app.stage.removeChild(g);
      this.islandSprites = [];
      for (const island of this.simulation.islands) {
        const g = new PIXI.Graphics();
        g.circle(0, 0, island.radius);
        g.fill({ color: 0x56a147 });
          g.stroke({ color: 0xd9ba80, width: 8, alignment: 1 });
        g.x = island.x;
        g.y = island.y;
        this.app.stage.addChildAt(g, 1); 
        this.islandSprites.push(g);
      }
    }

    // 1. Sincroniza Jogador
    this.playerContainer.x = this.simulation.player.x;
    this.playerContainer.y = this.simulation.player.y;
    // Adicionamos Math.PI para inverter a frente do navio visualmente
    this.playerSprite.rotation = this.simulation.player.rotation + Math.PI;
    
    const maxHp = this.simulation.config?.player.maxHealth ?? 300;
      const pPercent = Math.max(0, this.simulation.player.health / maxHp);
    const hpContainerP = this.playerContainer.getChildByLabel('hp_container') as PIXI.Container;
    const pHpMask = hpContainerP?.getChildByLabel('hp_mask') as PIXI.Graphics;
    if (pHpMask) {
      pHpMask.clear();
      pHpMask.rect(-80, -20, 160 * pPercent, 40);
      pHpMask.fill({ color: 0xffffff }); 
    }

    // 2. Sincroniza Projéteis
    const currentProjIds = new Set<number>();
    for (const p of this.simulation.projectiles) {
      currentProjIds.add(p.id);
      let sprite = this.projectileSprites.get(p.id);
      if (!sprite) {
        sprite = this.createProjectileSprite();
        this.app.stage.addChild(sprite);
        this.projectileSprites.set(p.id, sprite);
      }
      sprite.x = p.x;
      sprite.y = p.y;
    }

    for (const [id, sprite] of this.projectileSprites) {
      if (!currentProjIds.has(id)) {
        this.app.stage.removeChild(sprite);
        sprite.destroy();
        this.projectileSprites.delete(id);
      }
    }

    // 3. Sincroniza Inimigos
    const currentEnemyIds = new Set<number>();
    for (const e of this.simulation.enemies) {
      currentEnemyIds.add(e.id);
      let container = this.enemyContainers.get(e.id);
      if (!container) {
        container = new PIXI.Container();
        const shipSprite = new PIXI.Sprite(e.type === 'chaser' ? this.texChaser : this.texShooter);
        shipSprite.anchor.set(0.5);
        shipSprite.label = 'ship';
        container.addChild(shipSprite);
        
        const hpContainer = new PIXI.Container();
        hpContainer.label = 'hp_container';
        hpContainer.y = -50;
        hpContainer.scale.set(0.5);
        container.addChild(hpContainer);

        const hpFrame = new PIXI.Sprite(this.texEnemyHpFrame);
        hpFrame.anchor.set(0.5);
        hpContainer.addChild(hpFrame);

        const hpFill = new PIXI.Sprite(this.texEnemyHpFill);
        hpFill.label = 'hp_fill';
        hpFill.anchor.set(0.5);
        hpContainer.addChild(hpFill);
        
        const mask = new PIXI.Graphics();
        mask.label = 'hp_mask';
        hpFill.mask = mask;
        hpContainer.addChild(mask);

        this.app.stage.addChild(container);
        this.enemyContainers.set(e.id, container);
      }
      
      container.x = e.x;
      container.y = e.y;
      
      const shipSprite = container.getChildByLabel('ship') as PIXI.Sprite;
      if (shipSprite) shipSprite.rotation = e.rotation + Math.PI;

      const maxHp = e.type === 'chaser' 
        ? (this.simulation.config?.enemy.chaser.health ?? 2) 
        : (this.simulation.config?.enemy.shooter.health ?? 3);
      const percent = Math.max(0, e.health / maxHp);
      const hpContainer = container.getChildByLabel('hp_container') as PIXI.Container;
      if (hpContainer) {
        const hpMask = hpContainer.getChildByLabel('hp_mask') as PIXI.Graphics;
        if (hpMask) {
          hpMask.clear();
          hpMask.rect(-80, -20, 160 * percent, 40);
          hpMask.fill({ color: 0xffffff }); 
        }
      }
    }

    for (const [id, container] of this.enemyContainers) {
      if (!currentEnemyIds.has(id)) {
        this.spawnExplosion(container.x, container.y);
        this.app.stage.removeChild(container);
        container.destroy({ children: true });
        this.enemyContainers.delete(id);
      }
    }
    
    // 4. Sincroniza Explosões
    for (let i = this.activeExplosions.length - 1; i >= 0; i--) {
      const exp = this.activeExplosions[i];
      exp.age += ticker.deltaMS;
      
      if (exp.age > 240) {
        this.app.stage.removeChild(exp.sprite);
        exp.sprite.destroy();
        this.activeExplosions.splice(i, 1);
      } else {
        const frameIndex = Math.floor(exp.age / 80);
        exp.sprite.texture = this.texExplosions[Math.min(frameIndex, 2)];
      }
    }
  }

  destroy() {
    try {
      this.app.destroy(true, { children: true });
    } catch (e) {
      // Ignora aviso interno do PixiJS v8 ao destruir container com resizeTo
    }
  }
}
