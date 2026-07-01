## Objetivo
Implementar uma verificação de versão obrigatória no app Capacitor Android. Se o app estiver desatualizado, o usuário verá uma tela de bloqueio com link direto para a atualização na Google Play Store.

## O que será construído

### 1. Plugin Capacitor para leitura de versão nativa
- Instalar `@capacitor/app` (plugin oficial) para obter `versionName` e `versionCode` do build Android nativo.
- Instalar `@capacitor/browser` para abrir a Play Store de forma confiável dentro do app.

### 2. Configuração remota de versão mínima
- Criar uma tabela `app_version_config` no Lovable Cloud (Supabase) com RLS, contendo:
  - `min_version_name` (ex: `"1.5.1"`)
  - `force_update` (booleano)
  - `updated_at`
- Criar uma policy para leitura pública (ou via edge function), já que o check acontece antes do login.
- Criar um hook `useAppVersionCheck` que consulta essa configuração via React Query.

### 3. Hook de comparação de versões
- Criar `src/hooks/useForceUpdate.ts` que:
  1. Lê a versão nativa via `App.getInfo()`.
  2. Busca a versão mínima obrigatória no backend.
  3. Compara semânticamente (major.minor.patch).
  4. Retorna `needsUpdate: boolean` e `isLoading`.

### 4. Tela de bloqueio (Force Update)
- Criar `src/components/ForceUpdateScreen.tsx`:
  - Layout full-screen centralizado, estilo consistente com o app.
  - Ícone de alerta + título "Atualização necessária".
  - Texto explicativo: "Uma nova versão do Lottos está disponível com melhorias e correções."
  - Botão principal "Atualizar na Play Store" que abre o link da loja via `Browser.open()`.
  - Botão secundário "Tentar novamente" para recarregar a verificação.

### 5. Integração no fluxo principal
- Em `src/App.tsx`, adicionar a verificação junto ao `AgeGate`:
  - Se `needsUpdate === true`, renderiza `<ForceUpdateScreen />` em vez do `<BrowserRouter>`.
  - Enquanto `isLoading`, mostra um `<Skeleton>` ou spinner para não travar a inicialização.

### 6. Documentação de uso
- Adicionar instruções em `docs/BUILD-WINDOWS.md` (ou arquivo separado) explicando:
  - Como editar a versão mínima obrigatória na tabela do backend antes de publicar um release crítico.
  - Como desativar o force-update (setar `force_update = false`) caso precise de rollback.

## Pontos de decisão (não bloqueantes)
- **Formato da versão:** usaremos `versionName` (string semântica) e não `versionCode` (numérico), pois o `versionName` é legível e fácil de comparar.
- **Play Store URL:** `https://play.google.com/store/apps/details?id=com.lottos.app` — aberto via `@capacitor/browser` para garantir que funcione dentro do wrapper nativo.

## Checklist de entrega
- [ ] `@capacitor/app` e `@capacitor/browser` instalados e sincronizados no Android.
- [ ] Tabela `app_version_config` criada no backend com RLS e GRANT adequados.
- [ ] Hook `useForceUpdate` funcional, comparando versão local vs. remota.
- [ ] Componente `ForceUpdateScreen` bloqueando o app quando necessário.
- [ ] Integrado em `App.tsx` antes do roteamento.
- [ ] Testado no preview web (deve ignorar a verificação quando `!isNative()`).
