package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Настройка WebView для HTTP
        bridge.getWebView().getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        bridge.getWebView().getSettings().setAllowFileAccessFromFileURLs(true);
        bridge.getWebView().getSettings().setAllowUniversalAccessFromFileURLs(true);
    }
}
