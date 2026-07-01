import { useEffect, useState, useCallback } from "react";
import { App } from "@capacitor/app";
import { supabase } from "@/integrations/supabase/client";
import { isNative } from "@/lib/platform";

export interface ForceUpdateState {
  needsUpdate: boolean;
  isLoading: boolean;
  error: string | null;
  checkAgain: () => void;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function useForceUpdate(): ForceUpdateState {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For web preview, skip the check entirely
      if (!isNative()) {
        setNeedsUpdate(false);
        setIsLoading(false);
        return;
      }

      const info = await App.getInfo();
      const localVersion = info.versionName || info.version || "0.0.0";

      const { data, error: supaError } = await supabase
        .from("app_version_config")
        .select("min_version_name, force_update")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (supaError) {
        throw supaError;
      }

      const minVersion = data?.min_version_name || "0.0.0";
      const force = data?.force_update ?? false;

      const outdated = compareVersions(localVersion, minVersion) < 0;
      setNeedsUpdate(force && outdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Fail-open: if we can't reach the backend, don't block the user
      setNeedsUpdate(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { needsUpdate, isLoading, error, checkAgain: check };
}
