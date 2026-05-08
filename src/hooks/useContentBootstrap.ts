import { useEffect, useState } from "react";
import { hydrateContentFromDatabase } from "../api/contentApi";
import { useUiStore } from "../stores/uiStore";

type ContentBootstrapState = {
  ready: boolean;
  error: string;
};

export function useContentBootstrap(): ContentBootstrapState {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const bumpLocaleVersion = useUiStore((s) => s.bumpLocaleVersion);

  useEffect(() => {
    let cancelled = false;

    void hydrateContentFromDatabase()
      .then(() => {
        if (!cancelled) {
          bumpLocaleVersion();
          setReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Content load failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bumpLocaleVersion]);

  return { ready, error };
}
