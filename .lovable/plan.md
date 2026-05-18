## Objetivo
Trocar `bunx tsx` por `npx tsx` nos scripts `predev` e `prebuild` do `package.json`, e garantir que `tsx` esteja disponível via `devDependencies` para que o build funcione no Windows sem Bun instalado.

## Mudanças

**`package.json`**
- `"predev": "bunx tsx scripts/generate-sitemap.ts"` → `"predev": "npx tsx scripts/generate-sitemap.ts"`
- `"prebuild": "bunx tsx scripts/generate-sitemap.ts"` → `"prebuild": "npx tsx scripts/generate-sitemap.ts"`
- Adicionar `"tsx": "^4.19.2"` em `devDependencies` para que `npx tsx` resolva localmente sem download interativo (npx pode pedir confirmação se o pacote não estiver instalado).

## Resultado esperado
No Windows o usuário pode rodar:
```powershell
git stash
git pull
npm install
npm run build:android:win
```
sem precisar do Bun. O sitemap continuará sendo gerado normalmente antes do `vite build`.