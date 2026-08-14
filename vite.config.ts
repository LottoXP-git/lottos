import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mcpPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Alvo fixo: evita que o esbuild tente "rebaixar" sintaxe moderna
    // (destructuring etc.) para browserslist herdado, o que quebra o
    // build em algumas versões do esbuild. O WebView do Android/iOS
    // usado pelo Capacitor suporta ES2020+ sem problemas.
    target: "es2020",
  },
}));
