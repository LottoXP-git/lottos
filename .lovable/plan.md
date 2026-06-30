## Remover Picture-in-Picture (PiP)

Remover completamente o suporte a PiP do app Android.

### Alterações

**1. `android/app/src/main/AndroidManifest.xml`**
- Remover `android:supportsPictureInPicture="true"` da `<activity>`
- Remover `android:resizeableActivity="true"` (adicionado junto com PiP)

**2. `android/app/src/main/java/com/lottos/app/MainActivity.java`**
- Remover método `onUserLeaveHint()` que ativa o modo PiP
- Remover imports não utilizados: `PictureInPictureParams`, `Rational`

O resto (edge-to-edge, insets, boot log) permanece intacto.

### Após aprovação
Rodar `npx cap sync android` e regerar o AAB com `npm run build:android:checked:win`.
