## Plano

1. **Atualizar o lockfile do projeto**
   - Regenerar `package-lock.json` para refletir as versões já declaradas no `package.json`: `vite ^5.4.19` e `vitest ^3.2.4`.
   - Isso remove a resolução incompatível para `vite@8.0.16` / `vitest@4.1.8` que está causando o `ERESOLVE`.

2. **Manter compatibilidade com o plugin React SWC**
   - Preservar `@vitejs/plugin-react-swc@^3.11.0`, que aceita Vite até `^7`, portanto funciona com Vite 5.

3. **Validar instalação**
   - Confirmar que o lockfile não fixa mais `vite@8` nem `vitest@4`.
   - Você poderá rodar localmente depois:
     ```powershell
     npm install
     ```

## Observação local

Se seu `node_modules` local ainda estiver com Vite 8, rode antes no PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

Depois que eu ajustar o lockfile no projeto, o `npm install` normal deve voltar a resolver corretamente sem `--force` ou `--legacy-peer-deps`.