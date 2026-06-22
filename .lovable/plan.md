## Problema identificado

Os arquivos em `android/app/src/main/res/mipmap-*` ainda são os **placeholders padrão do Capacitor** (o "X" azul claro sobre fundo branco quadriculado), não o ícone oficial do Lottos. Por isso, após instalar o APK/AAB, a tela inicial do usuário mostra esse ícone genérico em vez da marca.

Verificações feitas:
- `AndroidManifest.xml` referencia corretamente `@mipmap/ic_launcher` e `@mipmap/ic_launcher_round`.
- `mipmap-anydpi-v26/ic_launcher.xml` está correto (adaptive icon com background `#FFFFFF` + foreground PNG).
- Todas as densidades existem (mdpi → xxxhdpi) com tamanhos corretos.
- **O conteúdo das PNGs é o placeholder do Capacitor** — confirmado por inspeção visual do `mipmap-xxxhdpi/ic_launcher.png`.

## O que será feito

Após você anexar o PNG oficial 1024×1024:

1. Salvar o original em `/tmp/lottos-icon-source.png`.
2. Gerar e sobrescrever, com Pillow, em todas as densidades:
   - `ic_launcher.png` (legado, Android < 8) — quadrado nos tamanhos 48, 72, 96, 144, 192.
   - `ic_launcher_round.png` (legado round) — mesmo tamanho com máscara circular.
   - `ic_launcher_foreground.png` (adaptive, Android 8+) — 108, 162, 216, 324, 432, com o logo ocupando ~66% central (safe zone) e o resto transparente.
3. Manter o fundo branco (`ic_launcher_background.xml = #FFFFFF`) conforme escolhido.
4. Manter o `adaptive-icon` XML existente (já está correto).
5. Atualizar também o ícone do PWA/web em `public/favicon.png` (mesma imagem) para manter consistência entre instalação Android e atalho web.

## Detalhes técnicos

```text
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png            (48×48)
│   ├── ic_launcher_round.png      (48×48, circular)
│   └── ic_launcher_foreground.png (108×108, safe zone 66dp)
├── mipmap-hdpi/                   (72 / 162)
├── mipmap-xhdpi/                  (96 / 216)
├── mipmap-xxhdpi/                 (144 / 324)
└── mipmap-xxxhdpi/                (192 / 432)
```

A safe zone do adaptive icon obriga o conteúdo a caber num círculo central de 66dp em 108dp — por isso a foreground será redimensionada para ~70% do canvas, evitando que máscaras circulares/squircle das fabricantes cortem o logo.

## Passos pós-deploy (você roda localmente)

Após o `git pull`:
```
npm install
npx cap sync android
./scripts/build-android.sh
```
O novo AAB já trará o ícone correto. Em devices que tinham a versão antiga instalada, o launcher pode levar alguns segundos (ou exigir reinstalação) para atualizar o cache de ícones.

## Fora do escopo

- Splash screen (continua como está — me avise se quiser refazer também).
- Ícone do iOS (não há projeto `ios/` no repositório atualmente).
