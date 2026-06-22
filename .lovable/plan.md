## Contexto
O app já está publicado nas lojas (Google Play / App Store) e a página de detalhes tem o site do desenvolvedor apontando para `grupolottoxp.com`. O publisher ID da conta é `pub-2147498950861352`.

## Objetivo
Criar o arquivo `app-ads.txt` e torná-lo acessível na raiz do domínio do desenvolvedor para que a AdMob possa rastreá-lo e verificá-lo.

## Plano de Implementação

### 1. Criar o arquivo `public/app-ads.txt`
O arquivo deve conter a mesma linha de autorização de vendedor já presente no `ads.txt` existente:

```
google.com, pub-2147498950861352, DIRECTIVECT, f08c47fec0942fa0
```

Ao colocar o arquivo na pasta `public/`, o Vite o copia para a raiz do build. Assim, após publicar o site, o arquivo ficará acessível em:
`https://grupolottoxp.com/app-ads.txt`

### 2. Verificar o ads.txt existente (sanity check)
Garantir que `public/ads.txt` ainda está presente e correto — não será alterado.

### 3. Publicar o site
Após a criação do arquivo, o site precisa ser republicado no Lovable para que o novo arquivo vá para o ambiente de produção.

## Pós-Implementação
- Aguardar a AdMob rastrear e verificar o arquivo (pode levar até 24h).
- Conferir o status na conta AdMob em: Apps → app-ads.txt.

## Nota
O arquivo `app-ads.txt` deve ficar **exatamente na raiz do domínio**, não em subdiretórios. O Lovable hosting com custom domain já atende esse requisito ao servir arquivos estáticos de `public/` na raiz.