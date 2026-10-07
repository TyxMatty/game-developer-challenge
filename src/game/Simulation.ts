// src/game/Simulation.ts

export class Simulation {
  private lastTime: number = 0;
  private animationFrameId: number = 0;
  private isRunning: boolean = false;

  // Estado do jogador na simulação (O PixiJS vai ler isso diretamente)
  public player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    rotation: 0,
    speed: 0,
    maxSpeed: 200, // Pixels por segundo
    turnSpeed: 2.5, // Radianos por segundo
  };

  public input = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => this.handleKey(e.code, true); // Marca a tecla como pressionada
  private onKeyUp = (e: KeyboardEvent) => this.handleKey(e.code, false); // Marca a tecla como liberada

  private handleKey(code: string, isPressed: boolean) {
    if (code === 'KeyW' || code === 'ArrowUp') this.input.up = isPressed; // move para frente com w
    if (code === 'KeyS' || code === 'ArrowDown') this.input.down = isPressed; // move para trás com s
    if (code === 'KeyA' || code === 'ArrowLeft') this.input.left = isPressed; // vira para a esquerda com a
    if (code === 'KeyD' || code === 'ArrowRight') this.input.right = isPressed; // vira para a direita com d
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
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

  private update(deltaMs: number) {
    // limitamos o delta para o barco não "teleportar" se a aba der uma travada
    const dt = Math.min(deltaMs / 1000, 0.1); 

    // 1. Rotação
    if (this.input.left) this.player.rotation -= this.player.turnSpeed * dt;
    if (this.input.right) this.player.rotation += this.player.turnSpeed * dt;

    // 2. Aceleração
    let thrust = 0;
    if (this.input.up) thrust = 1;
    if (this.input.down) thrust = -0.5; // Ré é mais lenta

    this.player.speed = thrust * this.player.maxSpeed;

    // 3. Movimento direcional (Trigonometria pura)
    // No PixiJS, a imagem do barco aponta para CIMA, então 0 radianos = CIMA (Y negativo).
    const dx = Math.sin(this.player.rotation) * this.player.speed * dt;
    const dy = -Math.cos(this.player.rotation) * this.player.speed * dt;

    this.player.x += dx;
    this.player.y += dy;
  }
}