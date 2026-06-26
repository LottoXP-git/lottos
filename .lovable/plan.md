### Objetivo
Adicionar um rodapé visual nos cards de loteria indicando que são clicáveis para mais detalhes.

### Escopo
- **Arquivo alvo:** `src/components/LotteryCard.tsx`
- **Mudança:** Inserir um elemento de rodapé dentro do `Card` (após o `CardContent`) com texto "Clique para mais detalhes" e um ícone sutil (ex: `ChevronDown` ou `Info`), estilizado com opacidade reduzida para não competir com o conteúdo principal.

### Detalhes técnicos
- Usar classes Tailwind consistentes com o tema do card (texto branco com baixa opacidade).
- Garantir que o elemento não interfira com clicks nos elementos internos (Link, ShareCardImageButton).
- O `onClick` do card já está no `Card` wrapper, então o rodapé será puramente informativo.

### Entrega
- `LotteryCard.tsx` com o novo rodapé informativo em todos os cards.