# EPEC (Jungle Gaming Edition): Plano de Desenvolvimento e Divisão de Tarefas

Matty aqui! Este é o plano focado no Desafio Pirate Battle, com base no README do teste e utilizando os mesmos princípios modulares e escaláveis que eu sigo.

---

## O que já temos (Nossa Base):
- [x] Setup do projeto (React, TypeScript, Vite).
- [x] Instalação das dependências (PixiJS, TanStack Query, Axios, MSW, Playwright).

---

## Próximos Passos (Tarefas a Executar)

### Tarefa 1: Arquitetura Base e Jogo (Simulation Layer)
- [x] Separar a lógica de simulação em TypeScript puro do renderizador PixiJS.
- [x] Implementar ciclo de jogo (Update Loop) independente de taxa de quadros (Baseado em Tempo/Delta).
- [ ] Gerenciamento centralizado de estado de combate.

### Tarefa 2: Renderização com PixiJS (View Layer)
- [x] Inicializar tela PixiJS dentro do React.
- [x] Carregador de Assets (Texturas e Spritesheets).
- [ ] Mapeamento do estado da simulação para os Sprites visuais do PixiJS.

### Tarefa 3: Gameplay e Controles
- [ ] Movimentação e Rotação do Jogador (WASD / Setas).
- [ ] Controles de Disparo (Frontal e Laterais).
- [ ] Spawn e Inteligência Artificial de Inimigos (Chaser e Shooter).
- [ ] Sistema de Dano, Vida e Colisões (com as Ilhas e Limites da Arena).

### Tarefa 4: Interface e Menus (React Layer)
- [ ] Menu Principal (Play, Options, Ranking, Match History).
- [ ] Tela de Opções (Duração da Sessão, Spawn de Inimigos, Persistência Local).
- [ ] HUD In-Game (Pontuação, Tempo Restante, Vida).
- [ ] Tela de Resultados.

### Tarefa 5: Mocking (MSW) e API (TanStack + Axios)
- [ ] Configuração do MSW para simular `/ranking` e `/history`.
- [ ] Integração com Axios e TanStack Query.
- [ ] Cenários de Falha, Timeout e Lentidão simulados e tratados.

### Tarefa 6: Qualidade e Testes (Playwright)
- [ ] Testes E2E dos Fluxos de Interface.
- [ ] Testes de Gameplay e Regressão Visual.
- [ ] Performance Profiling e Ajustes Finais.
