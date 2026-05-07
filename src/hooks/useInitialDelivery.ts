import { useEffect } from "react";
import { fetchDelivery } from "../api/deliveryApi";
import { setLocale } from "../i18n/locale";
import { useLocationStore } from "../stores/locationStore";

/** Fetches any persisted delivery from the server on mount and primes the store. */
export function useInitialDelivery(): void {
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);

  useEffect(() => {
    let cancelled = false;
    void fetchDelivery()
      .then((d) => {
        if (cancelled || !d) {
          return;
        }
        setDeliveryFromServer(d);
        if (d.countryCode) {
          setLocale(d.countryCode);
        }
      })
      .catch(() => {
        // Silently ignore — UI will simply require the user to set a location.
      });
    return () => {
      cancelled = true;
    };
  }, [setDeliveryFromServer]);
}
