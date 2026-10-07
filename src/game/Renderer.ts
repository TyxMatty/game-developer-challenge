// src/game/Renderer.ts
import * as PIXI from 'pixi.js';
import { Simulation } from './Simulation';

export class Renderer {
  public app: PIXI.Application;
  private simulation: Simulation;
  
  private playerSprite!: PIXI.Sprite; 
  constructor(simulation: Simulation) {
    this.simulation = simulation;
    this.app = new PIXI.Application();
  }

  // Recebe a div container do React
  async init(container: HTMLDivElement) {
    await this.app.init({
      resizeTo: container, // O Pixi se ajusta ao tamanho da Div automaticamente
      backgroundColor: 0x1099bb, 
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    // Injeta o canvas o Pixi dentro da nossa div do React
    container.appendChild(this.app.canvas);

    const shipTexture = await PIXI.Assets.load('/assets/png/default/ships/ship_1.png');
    this.playerSprite = new PIXI.Sprite(shipTexture);
    
    this.playerSprite.anchor.set(0.5); 
    this.playerSprite.x = this.app.screen.width / 2; // direção inicial do jogador (centro da tela), posição X
    this.playerSprite.y = this.app.screen.height / 2; // direção inicial do jogador (centro da tela), posição Y
    
    this.app.stage.addChild(this.playerSprite);
    this.app.ticker.add(this.render);
  }

  private render = () => {
    // Sincronização em breve!
    this.playerSprite.x = this.simulation.player.x;
    this.playerSprite.y = this.simulation.player.y;
    this.playerSprite.rotation = this.simulation.player.rotation;
  }

  destroy() {
    try {
      if (this.app) {
        // Destrói o Pixi e manda ele remover o próprio canvas do DOM
        this.app.destroy({ removeView: true });
      }
    } catch (e) {
      console.warn("Ignorando erro de cleanup:", e);
    }
  }
}