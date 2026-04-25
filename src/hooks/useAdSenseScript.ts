import { useEffect } from "react";

/**
 * Hook mantido por compatibilidade. O script do Google AdSense agora é
 * carregado estaticamente no <head> via index.html, conforme instrução oficial
 * do AdSense. Mantemos um useEffect vazio para preservar a contagem de hooks
 * em chamadas existentes.
 */
export function useAdSenseScript() {
  useEffect(() => {
    // no-op: script já está em index.html
  }, []);
}