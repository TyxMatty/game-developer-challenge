// src/game/Renderer.ts
import * as PIXI from 'pixi.js';
import { Simulation, type Projectile, type Enemy } from './Simulation';

export class Renderer {
  public app: PIXI.Application;
  private simulation: Simulation;
  
  private playerSprite!: PIXI.Sprite; 
  private projectileSprites: Map<number, PIXI.Graphics> = new Map();
  private enemySprites: Map<number, PIXI.Sprite> = new Map(); 
  
  // AQUI: Para não criar as ilhas dezenas de vezes, salvamos num array
  private islandSprites: PIXI.Graphics[] = [];

  private texChaser!: PIXI.Texture;
  private texShooter!: PIXI.Texture;

  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.app = new PIXI.Application();
  }

  async init(container: HTMLDivElement) {
    await this.app.init({
      resizeTo: container,
      backgroundColor: 0x1099bb, 
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    container.appendChild(this.app.canvas);

    const shipTexture = await PIXI.Assets.load('/assets/png/default/ships/ship_1.png');
    this.texChaser = await PIXI.Assets.load('/assets/png/default/ships/ship_3.png');
    this.texShooter = await PIXI.Assets.load('/assets/png/default/ships/ship_5.png');

    this.playerSprite = new PIXI.Sprite(shipTexture);
    this.playerSprite.anchor.set(0.5); 
    
    this.app.stage.addChild(this.playerSprite);
    this.app.ticker.add(this.render);
  }

  private createProjectileSprite(owner: 'player' | 'enemy'): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 4); 
    graphics.fill({ color: owner === 'player' ? 0xffcc00 : 0xff3333 }); 
    return graphics;
  }

  private render = () => {
    // 0. Sincroniza Ilhas de Areia (Acontece 1 única vez)
    if (this.islandSprites.length === 0 && this.simulation.islands.length > 0) {
      for (const island of this.simulation.islands) {
        const g = new PIXI.Graphics();
        g.circle(0, 0, island.radius);
        g.fill({ color: 0xdbca9b }); // Cor de Areia (Sand)
        g.x = island.x;
        g.y = island.y;
        
        // Coloca a ilha no layer mais de baixo possível (index 0)
        this.app.stage.addChildAt(g, 0); 
        this.islandSprites.push(g);
      }
    }

    // 1. Sincroniza o Navio Principal
    if (this.playerSprite) {
      this.playerSprite.x = this.simulation.player.x;
      this.playerSprite.y = this.simulation.player.y;
      // INVERTENDO O SPRITE: Adiciona 180 graus (Math.PI) visualmente, para manter a orientação correta do navio
      this.playerSprite.rotation = this.simulation.player.rotation + Math.PI; 
    }

    // 2. Sincroniza as Balas
    const currentProjIds = new Set<number>();
    for (const p of this.simulation.projectiles) {
      currentProjIds.add(p.id);

      let sprite = this.projectileSprites.get(p.id);
      if (!sprite) {
        sprite = this.createProjectileSprite(p.owner);
        this.app.stage.addChild(sprite);
        this.projectileSprites.set(p.id, sprite);
      }
      sprite.x = p.x;
      sprite.y = p.y;
    }

    // 3. Sincroniza Inimigos
    const currentEnemyIds = new Set<number>();
    for (const e of this.simulation.enemies) {
      currentEnemyIds.add(e.id);

      let sprite = this.enemySprites.get(e.id);
      if (!sprite) {
        sprite = new PIXI.Sprite(e.type === 'chaser' ? this.texChaser : this.texShooter);
        sprite.anchor.set(0.5);
        this.app.stage.addChild(sprite);
        this.enemySprites.set(e.id, sprite);
      }
      
      sprite.x = e.x;
      sprite.y = e.y;
      // INVERTENDO O SPRITE DO INIMIGO TAMBÉM.
      sprite.rotation = e.rotation + Math.PI; 
    }

    // 4. Clean Up
    for (const [id, sprite] of this.projectileSprites.entries()) {
      if (!currentProjIds.has(id)) {
        this.app.stage.removeChild(sprite);
        sprite.destroy();
        this.projectileSprites.delete(id);
      }
    }

    for (const [id, sprite] of this.enemySprites.entries()) {
      if (!currentEnemyIds.has(id)) {
        this.app.stage.removeChild(sprite);
        sprite.destroy();
        this.enemySprites.delete(id);
      }
    }
  }

  destroy() {
    try {
      if (this.app) {
        this.app.destroy({ removeView: true });
      }
    } catch (e) {
      console.warn("Ignorando erro de cleanup:", e);
    }
  }
}