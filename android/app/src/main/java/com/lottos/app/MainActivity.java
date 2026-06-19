package com.lottos.app;

import android.app.PictureInPictureParams;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.util.Rational;
import android.view.WindowManager;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LottosBoot";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Android 15+ (SDK 35+): habilita edge-to-edge com compatibilidade
        // retroativa. Mantém o WebView desenhando atrás das barras do sistema
        // sem quebrar layouts em versões anteriores.
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
        // Android 15+ (SDK 35+) deprecou LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        // (usado internamente por EdgeToEdge.enable em versões antigas da androidx.activity).
        // Forçamos o modo ALWAYS, recomendado para apps edge-to-edge no Android 15+.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        }
        // Defensive boot log: if the WebView loads anything other than
        // https://localhost/ (the Capacitor local asset scheme), the app
        // was built with a stray server.url and will fail offline.
        try {
            String url = this.bridge != null && this.bridge.getWebView() != null
                ? this.bridge.getWebView().getUrl()
                : "(webview not ready)";
            Log.i(TAG, "MainActivity onCreate — initial WebView URL: " + url);
            Log.i(TAG, "If URL is not https://localhost/, check capacitor.config.ts for server.url");
        } catch (Exception e) {
            Log.w(TAG, "Failed to read initial WebView URL", e);
        }
    }

    /**
     * Picture-in-Picture: ao sair do app (Home/recents), entra em modo PiP
     * permitindo que o usuário continue acompanhando resultados/sorteios
     * em uma janela flutuante enquanto usa outros apps.
     */
    @Override
    public void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams params = new PictureInPictureParams.Builder()
                    .setAspectRatio(new Rational(9, 16))
                    .build();
                enterPictureInPictureMode(params);
            } catch (Exception e) {
                Log.w(TAG, "Failed to enter PiP mode", e);
            }
        }
    }
}
