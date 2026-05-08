import { useEffect, useState } from "react";
import { hydrateContentFromDatabase } from "../api/contentApi";
import { useUiStore } from "../stores/uiStore";

export function useContentBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  const bumpLocaleVersion = useUiStore((s) => s.bumpLocaleVersion);

  useEffect(() => {
    let cancelled = false;

    hydrateContentFromDatabase()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (!cancelled) {
          bumpLocaleVersion();
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bumpLocaleVersion]);

  return ready;
}
