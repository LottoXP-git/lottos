
# Tour Inicial com Toasts Explicativos

## Objetivo
Na primeira visita do usuário (após o Age Gate), exibir uma sequência de toasts (`sonner`) apresentando as principais funcionalidades do app. Disparar uma única vez por dispositivo, com possibilidade de pular.

## Comportamento

- Dispara apenas se `localStorage["lottos_tour_v1_done"]` não existir.
- Inicia ~1,2s após o Age Gate ser concluído / após montagem da Home.
- Mostra 5 toasts em sequência (intervalo ~3,5s entre eles), cada um com título, descrição e ícone temático.
- Cada toast tem duração ~5s, posição `top-center` em mobile / `bottom-right` em desktop.
- Primeiro toast inclui ação "Pular tour" que cancela os próximos e marca como concluído.
- Último toast inclui ação "Entendi!" que também marca conclusão.
- Ao final (natural ou pulado), grava `localStorage["lottos_tour_v1_done"] = "1"`.
- Versionado (`_v1`) para permitir relançar um novo tour no futuro alterando a chave.

## Conteúdo dos toasts

1. **Bem-vindo ao Lottos! 🎲** — "Resultados oficiais e ferramentas para todas as loterias da Caixa. Vamos te mostrar o essencial." (ação: Pular tour)
2. **Resultados em tempo real 📊** — "Toque em qualquer card de loteria para ver detalhes, dezenas sorteadas e prêmios."
3. **Gerador Inteligente de Palpites 🧠** — "Use estatísticas reais (números quentes/frios) para gerar combinações com mais critério."
4. **Conferidor de Apostas ✅** — "Cole seu jogo e descubra rapidamente se você ganhou — sem precisar olhar dezena por dezena."
5. **Histórico e Estatísticas 📈** — "Navegue por sorteios anteriores e veja frequência, atrasos e rankings." (ação: Entendi!)

## Arquivos

- **Criar** `src/hooks/useInitialTour.ts`
  - Hook sem dependências externas além de `sonner`.
  - Expõe `useInitialTour()` que: checa flag, agenda os toasts com `setTimeout`, cancela timers em unmount, marca flag ao concluir/pular.
  - Função interna `markDone()` grava no `localStorage`.
- **Editar** `src/pages/Index.tsx`
  - Chamar `useInitialTour()` no topo do componente (executa só uma vez no mount).

## Não-objetivos

- Não modificar `AgeGate`, layout, rotas, design system ou qualquer outra tela.
- Não adicionar dependências novas (usa `sonner` já existente).
- Não criar overlays/spotlights — apenas toasts.
- Sem botão "rever tour" nesta entrega (pode ser adicionado depois).
