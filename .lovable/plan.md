## Adicionar sitemap.xml ao .gitignore

Como o `public/sitemap.xml` é regenerado automaticamente pelo `scripts/generate-sitemap.ts` a cada build, mantê-lo versionado causa conflitos no `git pull`.

### Mudanças

1. **`.gitignore`** — adicionar linha:
   ```
   public/sitemap.xml
   ```

2. **`git rm --cached public/sitemap.xml`** — instrução para o usuário rodar localmente para parar de versionar o arquivo (o arquivo físico permanece e será regerado no build).

### Após implementar

Usuário roda localmente:
```bash
git checkout -- public/sitemap.xml
git pull
git rm --cached public/sitemap.xml
git commit -m "chore: untrack generated sitemap"
```
