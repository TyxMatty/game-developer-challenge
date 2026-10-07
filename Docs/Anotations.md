# Pirate Battle: Code Review e Anotações de Qualidade e Arquitetura

Histórico de revisões técnicas, decisões de design e melhorias aplicadas no Desafio Pirate Battle, seguindo os princípios arquiteturais: anti-spaghetti e Lego; para se manter a escalabilidade.

---

## 1. Arquitetura e Desacoplamento (Lego, não God Object)

**Diretriz Central:**
A regra de ouro é separar completamente a "Lógica do Jogo" da "Renderização" e da "Interface do Usuário". 
- **Core da Simulação (TypeScript):** Contém todas as regras de tempo, spawn, HP, cooldowns, colisões e posição. Não depende de bibliotecas gráficas.
- **Renderização (PixiJS):** Apenas lê o Core da Simulação e desenha os sprites correspondentes na tela.
- **Interface (React):** Sobrepõe o canvas, exibe menus e dialoga com a Simulação para exibir Vida, Tempo e Pontos, usando mecanismos que não acionem renderizações a cada frame (ex: referências diretas ou stores especializadas).

---

## 2. Padrões de Estado (Anti-Spaghetti)

- **Dados de Ranking e Histórico:** O React Query lidará exclusivamente com o cache assíncrono dessas duas APIs.
- **Estado de Partida:** O estado do jogo deve ser encapsulado, facilitando o "pause", a "retomada" ou o "descarte" limpo da partida atual (liberando RAM e referências para não gerar memory leaks ao sair).

---

## 3. Mocking e Rede (MSW)

- Utilizar MSW no nível da rede para garantir que toda a aplicação "acredite" estar conectada a uma API real.
- Criaremos delays arbitrários e simulações de erro 500/400 diretamente nos Handlers do MSW, garantindo que o TanStack Query consiga ativar suas estratégias de Fallback/Retry sem código "sujo" espalhado pelos componentes.

---

## 4. Comentários e Variáveis.

- Seguindo o formato global, as variaveis e comentários são todo em inglês.
