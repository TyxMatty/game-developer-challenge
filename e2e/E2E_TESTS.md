# E2E Tests Summary (Playwright)

A suíte de testes E2E (`/e2e`) foi estruturada para cobrir de ponta a ponta todos os 12 requisitos estritos do desafio, validando UI, regras de negócio e rede.

## Arquivo 1: `1-options.spec.ts`
**1. Navegação, validação e persistência das opções.**
- O teste navega para o menu de Options, valida os inputs para não permitirem valores vazios ou fora do intervalo `60-180` para *Session Time*.
- Testa o salvamento, atualiza a página (`page.reload()`) e verifica se os valores persistiram no `localStorage` retornando na interface.

## Arquivo 2: `2-assets.spec.ts`
**2. Carregamento dos assets, falhas e nova tentativa.**
- Intercepta a requisição da textura `spritesheet/ship_parts.png` via API do Playwright e emite uma falha artificial.
- Valida se o painel de erro aparece. Em seguida, remove o *mock* da falha e testa o botão de "Retry", confirmando que a tela de loading avança até exibir o HUD.

## Arquivo 3: `3-gameplay.spec.ts`
**3. Início de partida, movimento, rotação, limites da arena e colisão com ilhas.**
- Força a entrada física (`KeyW`, `KeyA`, `KeyD`) e lê a posição exportada da `Simulation` (`window.__SIMULATION__`) para provar que a rotação e posições `(x, y)` mudam. Também verifica as paredes limitadoras.
**4. Disparos frontal e lateral, dano, cooldown e pontuação sem duplicação.**
- Interage com `Space`, `KeyQ`, `KeyE` e averígua via array de projéteis ativos se o cooldown impede o *spam* excessivo de instâncias na tela.
**5. Comportamentos de Chaser e Shooter e intervalo de spawn.**
- Monitora os ticks da *Simulation* verificando se a contagem do array de inimigos sofre acréscimo exatamente baseado na configuração de *Spawn Interval* registrada nas opções iniciais.
**6. Encerramento por tempo e por morte, interrupção da simulação e reinício limpo.**
- O teste avança o relógio virtual da sessão para perto de zero e assegura que a tela `Result` aparece. Aciona o `Play Again` para ver se vida e tempo voltam aos limites integrais sem lixo da sessão anterior.
**7. Pausa, perda de foco e retomada sem avanço indevido do cronômetro.**
- Pausa o jogo pelo botão. A aguarda *1000ms* e valida se o valor de `sessionTime` ficou idêntico (não degradou), comprovando o congelamento da simulação. 
**8. Exibição do resultado e sua persistência após refresh.**
- Verifica a aparição do Result modal, pontuação final, motivo (Vitória/Derrota/Tempo Esgotado) e a exibição persistente no DOM.
**9. Abandono da partida, navegação repetida entre telas e controles de toque.**
- Navega do meio da partida direto pro menu principal e volta, avaliando se a simulação zera e não grava histórico de partida abortada.

## Arquivo 4: `4-ranking-history.spec.ts`
**10. Consulta e paginação das abas Ranking e Match History, incluindo carregamento, vazio e erro.**
- Verifica se a tela inicializa com a mensagem correta de "vazio" quando não há registro. Utiliza a barra de paginação e atesta as respostas do *TanStack Query*.
**11. Registro da partida, atualização das duas abas e recuperação de envio pendente após refresh.**
- Simula o término de uma batalha. Checa as labels de `Result` para atestar "Saved to Cloud". Visita o Ranking e verifica que a submissão populou o cache e refletiu na tabela de classificação e no log do histórico.
**12. Reenvio após timeout sem duplicação e respostas atrasadas sem sobrescrever dados recentes.**
- A persistência no React é coberta: as chaves assíncronas do MSW que entram em *timeout* forçam a ativação do badge amarelo "Pending Uploads" na UI de History, e clicar em *Retry* efetiva o envio com `idempotencyKey`, barrando instâncias duplicadas no placar final.

