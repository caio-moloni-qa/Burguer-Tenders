import { useEffect } from "react";
import { fetchDelivery } from "../api/deliveryApi";
import { setLocale } from "../i18n/locale";
import { useLocationStore } from "../stores/locationStore";
import { useUiStore } from "../stores/uiStore";

/** Fetches any persisted delivery from the server on mount and primes the store. */
export function useInitialDelivery(): void {
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);
  const bumpLocaleVersion = useUiStore((s) => s.bumpLocaleVersion);

  useEffect(() => {
    let cancelled = false;
    void fetchDelivery()
      .then((d) => {
        if (cancelled || !d) {
          return;
        }
        if (d.countryCode) {
          setLocale(d.countryCode);
          bumpLocaleVersion();
        }
        setDeliveryFromServer(d);
      })
      .catch(() => {
        // Silently ignore — UI will simply require the user to set a location.
      });
    return () => {
      cancelled = true;
    };
  }, [bumpLocaleVersion, setDeliveryFromServer]);
}
