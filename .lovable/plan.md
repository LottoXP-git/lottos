# Preview de imagem no compartilhamento do modal de detalhes

## Objetivo
No `LotteryDetailModal`, ao clicar em compartilhar, abrir um diálogo de pré-visualização exibindo um card PNG do resultado (com a identidade visual da loteria) antes de baixar/compartilhar — mesmo padrão já usado no `ShareablePickButton` (palpites) e `ShareCardImageButton` (export).

## Escopo
Apenas o botão de compartilhamento dentro de `src/components/LotteryDetailModal.tsx` (linhas 298–306). Demais usos do `ShareButton` permanecem inalterados.

## Implementação

### 1. Novo componente `src/components/ShareResultImageButton.tsx`
- Baseado no `ShareablePickButton` (Canvas 1080×1350, gradiente por modalidade via tabela `THEMES`, bolinhas com mesmo estilo do `LotteryBall`, faixa de marca "LOTTOS" no topo, rodapé com `lottos.lovable.app`).
- Props:
  - `lotteryName`, `lotteryId`, `lotteryColor`
  - `concurso`, `date`, `nextDate`
  - `numbers`, `trevos?`, `timeCoracao?`, `mesSorte?`
  - `nextPrize`, `accumulated?`
- Conteúdo do card:
  - Header: nome da loteria + "Concurso N • dd/mm/aaaa"
  - Bloco central: bolinhas (com tamanho responsivo conforme quantidade, mesma lógica do `ShareablePickButton`)
  - Chips de extras (Trevos / Time / Mês) quando existirem
  - Rodapé: "Próximo prêmio: R$ ..." + selo "Acumulado!" quando aplicável + URL
- Fluxo:
  1. Botão (mesmo visual atual: ghost, ícone Share2, tamanho `h-9 w-9 sm:h-10 sm:w-10`).
  2. Ao clicar → gera canvas → abre `<Dialog>` com `<img>` da imagem em alta qualidade.
  3. Diálogo com botões: **Baixar PNG** (download direto) e **Compartilhar** (Web Share API com `files`; fallback para download).
  4. Toasts de sucesso/erro como nos componentes existentes.
- Limpeza do `URL.createObjectURL` no unmount (igual `ShareCardImageButton`).

### 2. Atualizar `src/components/LotteryDetailModal.tsx`
- Substituir `<ShareButton ... />` (linhas 300–305) por `<ShareResultImageButton ... />` passando os campos de `lottery`.
- Remover o import do `ShareButton` se não for mais usado no arquivo.
- Manter o wrapper `<div className="flex justify-center">` para preservar o layout (memória: share button centralizado acima dos ads).

## Detalhes técnicos
- Reaproveitar a tabela `THEMES` e helpers (`drawRoundedRect`, `todayBR`) do `ShareablePickButton` — extrair para `src/lib/shareCardCanvas.ts` para evitar duplicação, exportando `drawRoundedRect`, `THEMES`, `DEFAULT_THEME`. Refatorar `ShareablePickButton` para importar daí.
- Tipagem: usar `RefObject` não é necessário (renderização vem dos dados, não de um nó DOM).
- Sem mudanças em rotas, dados ou backend.

## Fora de escopo
- Outros usos do `ShareButton` (cards na home, histórico, etc.).
- Alterações de cópia/texto do compartilhamento existente.
- Reintroduzir gráfico de "Evolução dos Prêmios" (proibido por memória).
