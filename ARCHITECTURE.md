# Pirate Battle - Architecture & Design Decisions

## 1. Separação de Responsabilidades (Game Logic vs Rendering vs UI)
A arquitetura do projeto foi desenhada com três camadas principais completamente independentes:
- **`Simulation.ts` (Regras de Jogo):** Contém toda a lógica de negócio, física, comportamento de IAs (Chaser/Shooter), colisões, vida, cooldowns e controle de tempo/pausa. É independente de PixiJS ou React. Isso garante que a lógica é testável e não depende de componentes visuais. O estado contínuo do combate (`player`, `enemies`, `projectiles`) fica integralmente aqui.
- **`Renderer.ts` (Renderização PixiJS):** Responsável por carregar assets e desenhar o estado atual da simulação na tela. Ele é atualizado via `app.ticker`, lendo as coordenadas (x, y, rotation) da `Simulation` e refletindo em containers, sprites e gráficos do PixiJS.
- **React (Interface e Estado Externo):** Gerencia menus, configurações, estado de MSW/API, e ciclo de vida da partida. O componente `GameCanvas.tsx` serve como ponte: inicializa a `Simulation` e o `Renderer`, acopla o input do usuário via eventos de teclado/mouse para o objeto global `Input` usado pela `Simulation`, e escuta os callbacks `onGameOver` para sair do canvas de combate.

## 2. Simulação Baseada em Tempo (Time-Based Movement)
A `Simulation` recebe um `delta` em milissegundos a cada iteração (fornecido pelo ticker, através do loop principal acoplado ao RequestAnimationFrame).
- Todos os cálculos de velocidade (pixels por segundo) e cooldowns são escalados usando esse `delta`.
- O cálculo segue `(speed * delta) / 1000`. Isso garante movimento, dano e spawns completamente **independentes da taxa de quadros (framerate-independent)**.

## 3. Sincronização sem Renderizações React a cada frame
- O React **não** armazena o estado do navio (X/Y) nem a vida em tempo real utilizando hooks como `useState` ou Redux. Se o fizesse, haveria uma renderização do DOM em cada quadro, prejudicando drasticamente a performance de 60fps.
- As barras de vida (Player e Inimigos) e todos os efeitos rápidos (explosões, tiros) são manipulados **exclusivamente no PixiJS** via `Renderer.ts`.
- O React apenas aciona o início do jogo (`<GameCanvas />`) e aguarda o final via evento `onGameOver`.

## 4. Carregamento e Reutilização de Texturas
- Em `Renderer.ts`, utilizamos `PIXI.Assets.load()`.
- O carregamento emite eventos de progresso que o React captura (`onProgress`) para mostrar uma barra de carregamento antes de o combate iniciar.
- As texturas carregadas são armazenadas em atributos instanciados no `Renderer` (`texChaser`, `texShooter`, etc.) e atribuídas repetidamente aos novos inimigos que surgem (Reutilização/Flyweight), evitando recarregamento ou parsing adicional de imagens. 

## 5. Ajuste do Canvas e Densidade de Pixels
- O PixiJS foi inicializado com `resizeTo: container`, `autoDensity: true`, e `resolution: window.devicePixelRatio || 1`. Isso faz com que a arena suporte telas retina perfeitamente sem ficar borrada.
- O redimensionamento do `TilingSprite` de fundo de oceano acompanha `this.app.renderer.on('resize', ...)`, ajustando-se à tela. As colisões das paredes limitam o barco estritamente às coordenadas lógicas do mundo.

## 6. Cleanup (Liberação de Recursos e React Strict Mode)
- **`GameCanvas.tsx` (useEffect return):** Em React Strict Mode, os componentes são montados, desmontados e remontados. Para garantir que tudo funcione corretamente sem *memory leaks*, implementamos um *cleanup* rigoroso.
- Ao desmontar, o `Renderer` chama `this.app.destroy(true, { children: true })`, o que limpa toda a hierarquia webGL, libera texturas do cache da GPU para essa instância, para o ticker, destrói eventos internos do PixiJS e limpa o Canvas do DOM.
- A `Simulation` possui todos os arrays esvaziados e timers cessam. Listeners de teclado (keydown/keyup) e ponteiro/mouse acoplados no `window` em `GameCanvas.tsx` são explicitamente removidos com `removeEventListener`.
- A captura de eventos do teclado ocorre estritamente e somente enquanto o usuário interage e o canvas está ativo.

## 7. Mocking, Estado Offline e Idempotência
A integração com o Mock Service Worker (MSW) é configurável via `NetworkSimulator` e persistente. Se ocorrer erro de rede ou o jogador fechar o jogo no meio do carregamento, os matches completados pendentes ficam no `localStorage` via uma fila de retentativas offline (`client.ts`), garantindo consistência total do `MatchHistory`. A rota `POST /api/match` é desenhada com princípios idempotentes: duplicatas acidentais (timeout-retry) não resultam em dupla entrada no Ranking.

