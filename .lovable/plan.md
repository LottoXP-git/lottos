## Objetivo
Exibir um banner adaptativo AdMob (Android) fixo no rodapé do `LotteryDetailModal` enquanto ele estiver aberto. iOS e web ignoram (sem impacto).

## Ad Unit
- Android: `ca-app-pub-2147498950861352/1152796535` (banner adaptativo, produção)
- iOS/web: nenhum (early-return)

## Mudanças

### 1. `src/lib/admobUnits.ts` (novo)
Centralizar IDs por plataforma para evitar strings soltas:
```ts
export const ADMOB_UNITS = {
  lotteryDetailBanner: { android: "ca-app-pub-2147498950861352/1152796535" },
};
```

### 2. `src/hooks/useNativeBannerAd.ts` (ajuste mínimo)
Já suporta banner adaptativo com refCount global. Adicionar margem inferior configurável — o banner nativo é renderizado FORA da WebView (overlay do sistema), então precisamos empurrar o conteúdo do modal para não ficar coberto. Duas opções:

- **A (escolhida):** manter `position: BOTTOM_CENTER` e adicionar padding-bottom dinâmico ao `DialogContent` do modal (via prop/estado) quando o banner estiver ativo em nativo. Simples, sem mexer em posicionamento do AdMob.

### 3. `src/components/LotteryDetailModal.tsx`
- Importar `useNativeBannerAd`, `isNativeAndroid` (novo helper) e `ADMOB_UNITS`.
- Chamar o hook condicionalmente apenas quando `open === true` E `isNativeAndroid()`. Como hooks não podem ser condicionais, criamos um wrapper `<LotteryDetailAdSlot />` renderizado só quando `open` — ele monta/desmonta e o hook cuida do show/remove.
- Aplicar `pb-20` (safe area + altura do banner) ao container do modal só em Android nativo, para o conteúdo não ficar oculto pelo banner do sistema.

### 4. `src/lib/platform.ts`
Adicionar helper `isNativeAndroid()` (já existe `isNativeIOS` e `isNative`).

### 5. `src/lib/admob.ts`
Trocar `initializeForTesting: true` por `false` — estamos usando IDs de produção. Mantém idempotência via flag `initialized`.

## O que NÃO muda
- `NativeBannerMount` global (banner do app inteiro) continua igual — este novo slot é independente e o refCount do hook garante que só um banner esteja ativo por vez. Quando o modal abre, o refCount já estará ≥ 1 pelo banner global, então o modal NÃO disparará um segundo `showBanner`. **Ajuste necessário:** o modal precisa forçar seu próprio banner por cima do global. Solução: parametrizar o hook com uma `key`/`slot` e manter refCount POR slot, empilhando shows (o AdMob permite trocar via novo `showBanner`; ele substitui o atual). O modal chama `showBanner` do seu slot ao abrir e, no unmount, re-exibe o banner global.

Detalhe técnico simplificado: adicionar suporte a "stack" no hook — guardar o último `adId` global e restaurá-lo quando o modal fechar.

## Validação
- `npm run build` local (não roda AdMob na web).
- Verificar em device Android: abrir modal → banner aparece no rodapé com o novo unit; fechar → banner global volta.
- iOS/web: nenhum banner extra, sem erros no console.

## Fora de escopo
- iOS AdMob (mantém desativado, conforme plano iOS v1).
- Intersticiais e frequência capping.
