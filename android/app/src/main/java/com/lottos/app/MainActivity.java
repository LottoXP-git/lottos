package com.lottos.app;

import android.app.PictureInPictureParams;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.util.Rational;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LottosBoot";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Edge-to-edge manual: evita androidx.activity.EdgeToEdge, que
        // internamente referencia LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        // (descontinuado no Android 15 / SDK 35).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            // Android 15+ (SDK 35+): o sistema já força edge-to-edge
            // automaticamente para apps com targetSdk >= 35.
            // Só precisamos garantir o modo ALWAYS para o notch/cutout.
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
        } else {
            // Android < 15: edge-to-edge via WindowCompat (sem referência à
            // constante descontinuada). O conteúdo desenha atrás das barras do
            // sistema, mantendo compatibilidade retroativa.
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                getWindow().setStatusBarColor(Color.TRANSPARENT);
                getWindow().setNavigationBarColor(Color.TRANSPARENT);
            }
            WindowInsetsControllerCompat controller =
                new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
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
