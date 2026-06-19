package com.lottos.app;

import android.os.Bundle;
import android.util.Log;
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
