package com.lottos.app;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import androidx.activity.EdgeToEdge;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "LottosBoot";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Habilita edge-to-edge com compatibilidade retroativa usando a API
        // recomendada pelo Play Console para Java.
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Aplica os recuos (insets) das barras do sistema ao conteúdo da
        // WebView, evitando que header/footer fiquem escondidos atrás da
        // status bar ou navigation bar no Android 15+.
        try {
            final View root = findViewById(android.R.id.content);
            if (root != null) {
                ViewCompat.setOnApplyWindowInsetsListener(root, (v, windowInsets) -> {
                    Insets bars = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars()
                            | WindowInsetsCompat.Type.displayCutout()
                    );
                    v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                    return WindowInsetsCompat.CONSUMED;
                });
            }
        } catch (Exception e) {
            Log.w(TAG, "Failed to apply system bar insets", e);
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
}
