
## Objetivo

Contornar o erro de rate limit do OAuth do Google adicionando a verificação do Google Search Console manualmente, via meta tag no `<head>` do site.

## Passos

**1. Você cria a propriedade no Search Console**
- Acesse https://search.google.com/search-console com a conta `grupolottoxp@gmail.com`
- Adicionar propriedade → **Prefixo do URL** → `https://grupolottoxp.com`
- Escolha o método de verificação **Tag HTML**
- Copie o valor do atributo `content="..."` da meta tag exibida (algo como `google-site-verification=AbC123...`) e me envie no chat

**2. Eu adiciono a meta tag no projeto**
- Editar `index.html`, inserindo dentro do `<head>`:
  ```html
  <meta name="google-site-verification" content="VALOR_QUE_VOCÊ_ENVIAR" />
  ```

**3. Você publica o app**
- Clicar em Publish na Lovable para que `https://grupolottoxp.com` passe a servir o HTML com a tag

**4. Você confirma a verificação**
- Voltar ao Search Console e clicar em **Verificar**
- O Google lê a meta tag e a propriedade fica verificada

**5. Você submete o sitemap**
- Ainda no Search Console, menu **Sitemaps** → adicionar `sitemap.xml` (já está publicado em `https://grupolottoxp.com/sitemap.xml`)

## Detalhes técnicos

- A tag `<meta name="google-site-verification">` é estática e fica em `index.html` — não precisa do react-helmet-async, pois o Google busca direto no HTML do servidor.
- A tag pode permanecer no site indefinidamente; removê-la depois invalida a verificação.
- Não há mudanças em código React, rotas, ou backend. Apenas uma linha em `index.html`.

## Pré-requisito antes de implementar

Preciso que você me envie o `content="..."` gerado pelo Search Console no passo 1.
