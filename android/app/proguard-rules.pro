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
-dontwarn com.google.android.gms.**

# ---------------------------------------------------------------
# Regras defensivas adicionais para o R8 em fullMode.
# fullMode remove classes/métodos mais agressivamente e ignora
# regras -keepattributes implícitas de libs, então declaramos
# explicitamente o que costuma quebrar em apps Capacitor.
# ---------------------------------------------------------------

# Preserva anotações, genéricos, exceções e assinaturas — usados
# por Gson/Jackson (Capacitor bridge serializa JSON via reflexão),
# Kotlin metadata e stack traces legíveis no Play Console.
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod, Exceptions

# Plugins Capacitor (community e oficiais) são descobertos via
# reflexão pelo Bridge; sem isso @CapacitorPlugin some do bundle.
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.PluginMethod <methods>;
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
}
-keep class com.capacitorjs.** { *; }
-keep class com.getcapacitor.community.** { *; }

# AdMob (community plugin + SDK): callbacks são invocados por
# reflexão a partir do JNI/Play Services.
-keep class com.getcapacitor.community.admob.** { *; }
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Enums usados via valueOf() (comum em respostas JSON dos plugins).
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable / Serializable — Bridge repassa dados entre WebView e
# nativo; sem isso alguns intents/resultados voltam vazios.
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Silencia warnings de libs opcionais que o R8 fullMode reclama
# mesmo quando não são usadas em runtime.
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
-dontwarn javax.annotation.**
