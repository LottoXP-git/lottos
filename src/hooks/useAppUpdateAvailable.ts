import { useCallback, useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";
import { isNative } from "@/lib/platform";

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export interface AppUpdateState {
  updateAvailable: boolean;
  latestVersion: string | null;
  currentVersion: string | null;
  checkAgain: () => void;
}

/**
 * Detecta atualizações OPCIONAIS do app (soft update).
 * Compara a versão instalada com `latest_version_name` da tabela
 * `app_version_config`. Diferente do `useForceUpdate`, apenas sinaliza
 * que há uma nova versão disponível — não bloqueia o uso.
 */
export function useAppUpdateAvailable(): AppUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      if (!isNative()) return;
      const info = await App.getInfo();
      const local = info.version || "0.0.0";
      setCurrentVersion(local);

      const { data, error } = await supabase
        .from("app_version_config")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return;

      const latest =
        (data as { latest_version_name?: string }).latest_version_name ||
        data.min_version_name ||
        "0.0.0";
      setLatestVersion(latest);
      setUpdateAvailable(compareVersions(local, latest) < 0);
    } catch {
      // fail silent — nunca bloqueia o app
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return {
    updateAvailable,
    latestVersion,
    currentVersion,
    checkAgain: check,
  };
}