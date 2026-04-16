# Capacitor / WebView rules
-keep class com.getcapacitor.** { *; }
-keep class com.lottos.app.** { *; }

# Keep WebView JS interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve line numbers for crash debugging
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Google Play Services (Ads)
-keep class com.google.android.gms.** { *; }
-keep class com.google.ads.** { *; }
