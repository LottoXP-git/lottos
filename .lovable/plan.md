
# Quina de São João 2026 — Banner Especial

Criar destaque para o concurso especial Quina de São João (R$ 250 milhões, 28/06/2026 às 11h), seguindo o mesmo padrão já existente para Mega-Sena 30 anos e Dupla de Páscoa.

## Arquivos a criar

1. **`src/assets/quina-sao-joao-2026.jpg`** — salvar a imagem oficial enviada pelo usuário (poster azul/laranja com R$ 250 milhões).

2. **`src/utils/quinaSaoJoaoDate.ts`** — utilitário com a data alvo (28/06/2026 11:00 BRT) e helper `getQuinaSaoJoaoStatus()` retornando `'upcoming' | 'one-day' | 'live' | 'finished'`, espelhando `megaSena30Date.ts`.

3. **`src/components/QuinaSaoJoaoBanner.tsx`** — banner clicável na home, identidade visual azul-royal + laranja vibrante (cores do poster oficial), com:
   - Badge "Concurso Especial" + status (AO VIVO / FALTA 1 DIA / REALIZADO)
   - Título estilizado "Quina de São João"
   - Prêmio "R$ 250 MILHÕES" em destaque dourado
   - Selo "NÃO ACUMULA"
   - Data "28/06" em pill
   - Decoração com estrelas/fogos sutis (motion)

4. **`src/components/QuinaSaoJoaoModal.tsx`** — modal de detalhes ao clicar no banner:
   - Hero com poster oficial (`quina-sao-joao-2026.jpg`)
   - Contagem regressiva ao vivo (dias/horas/min/seg) — componente CountdownUnit estilo Mega 30
   - Data completa: Domingo, 28 de Junho de 2026 às 11h
   - Descrição + 4 highlights (prêmio R$ 250mi, não acumula, sorteio único, faixa especial 5 acertos)
   - CTA "Gerar palpites para a Quina de São João" → abre SmartPickGenerator com modalidade Quina

5. **`src/components/QuinaSaoJoaoModalSkeleton.tsx`** — skeleton de loading com mesmo layout do modal.

## Integração

6. **`src/pages/Index.tsx`** — renderizar `<QuinaSaoJoaoBanner />` próximo ao banner Mega 30 (acima das modalidades), com estado para abrir o modal. Lazy-load do modal via `React.lazy` + Suspense (skeleton).

## Detalhes técnicos

- Data alvo: `new Date("2026-06-28T11:00:00-03:00")`
- Status "live" entre 11h e 12h do dia 28/06/2026; "one-day" no dia 27/06; "finished" após 12h do dia 28
- Paleta: azul `#1B5FB8` (fundo poster), laranja `#F26A1F` (selo), dourado `#F0C24C` (prêmio)
- Sem mudanças no backend, sem novas dependências
- Reusa `LotteryBall` variant `quina` se necessário

## Memória
Adicionar entrada em `mem://features/` documentando o concurso especial Quina de São João 2026.
