# Captura visual do modal de detalhes

## Objetivo
Em vez de gerar um card customizado por canvas, a imagem do botão de compartilhar deve ser uma "printscreen" do conteúdo do modal de detalhes — mostrando exatamente o que o usuário vê: data, números (com layout específico de cada modalidade: Loteca, Federal, Dupla Sena, +Milionária com trevos, Time/Mês), locais de ganhadores, faixas de premiação, próximo prêmio e próximo sorteio.

## Abordagem
Usar **html2canvas-pro** (suporta `oklch` do Tailwind/shadcn, ao contrário do html2canvas original) para rasterizar o nó DOM da seção de conteúdo do modal.

## Implementação

### 1. Dependência
- `bun add html2canvas-pro`

### 2. `LotteryDetailModal.tsx`
- Envolver o bloco de conteúdo "printável" (linhas 61–296: resultado atual, ganhadores, premiações, próximo prêmio/sorteio) em um `<div ref={captureRef} data-share-capture>`.
- Excluir do snapshot: header do Dialog (já contém tudo no bloco), botão de compartilhar, Tabs de histórico/estatísticas/gerador (linhas 318+).
- Passar `captureRef` como prop para `ShareResultImageButton` (em vez dos campos individuais).

### 3. Reescrever `ShareResultImageButton.tsx`
- Nova assinatura: `{ targetRef: RefObject<HTMLElement>, lotteryName, lotteryId, concurso, date, nextPrize?, className? }` (os textuais ficam só para legenda/nome do arquivo/Web Share API).
- Remover toda a lógica `buildCard`, `THEMES`, `drawRoundedRect`.
- No clique:
  1. `import("html2canvas-pro")` dinâmico (lazy) para não pesar o bundle inicial.
  2. Capturar `targetRef.current` com `{ scale: 2, backgroundColor: getComputedStyle(document.body).backgroundColor, useCORS: true }`.
  3. Adicionar um wrapper temporário com cabeçalho da marca ("LOTTOS — Resultado Oficial") e rodapé ("lottos.lovable.app — Sem vínculo oficial com a Caixa") **antes** da captura: clonar o nó alvo dentro de um container off-screen (`position: fixed; left: -10000px; width: <largura desktop fixa, ex. 720px>; padding`), prefixar header/sufixar footer, e capturar esse container. Isso garante:
     - Largura consistente independente do viewport do usuário (mobile capturaria o layout `text-[10px]`).
     - Branding sempre presente.
     - Remoção limpa após a captura (`finally`).
  4. `canvas.toBlob("image/png")` → abrir `<Dialog>` com preview e botões "Baixar PNG" / "Compartilhar" (Web Share API com fallback de download — manter exatamente como está hoje).
- Manter limpeza de `URL.createObjectURL` no unmount.

### 4. Limpeza
- Apagar `THEMES`, `DEFAULT_THEME`, `drawRoundedRect`, `buildCard` do componente.
- Não há outros arquivos consumindo `ShareResultImageButton`.

## Detalhes técnicos
- **Por que html2canvas-pro e não html-to-image**: o projeto usa `oklch()` em tokens via Tailwind v3/shadcn — html2canvas original quebra com esse color space; `html2canvas-pro` é um fork mantido com suporte nativo.
- **Tema escuro/claro**: capturar com `backgroundColor` do `--background` atual garante coerência visual com o que o usuário vê.
- **Largura fixa no clone (720px)**: evita que a imagem saia espremida em telas pequenas e estoura o `text-[10px]` para um tamanho legível.
- **Performance**: import dinâmico evita ~150KB no bundle inicial.

## Fora de escopo
- Outros botões de compartilhamento (`ShareButton`, `ShareablePickButton`, `ShareCardImageButton`) permanecem como estão.
- Sem mudanças visuais no modal em si.
- Sem reintrodução de gráficos removidos.
