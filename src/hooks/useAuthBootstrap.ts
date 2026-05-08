import { useEffect } from "react";
import { fetchCurrentUser, fetchPreviousOrders } from "../api/authApi";
import { setLocale } from "../i18n/locale";
import { useAuthStore } from "../stores/authStore";
import { useLocationStore } from "../stores/locationStore";
import { useUiStore } from "../stores/uiStore";

export function useAuthBootstrap(): void {
  const setUser = useAuthStore((s) => s.setUser);
  const setOrders = useAuthStore((s) => s.setOrders);
  const setDeliveryFromServer = useLocationStore((s) => s.setDeliveryFromServer);
  const bumpLocaleVersion = useUiStore((s) => s.bumpLocaleVersion);

  useEffect(() => {
    let cancelled = false;
    void fetchCurrentUser()
      .then(async (user) => {
        if (cancelled) {
          return;
        }
        setUser(user);
        if (user?.location) {
          setLocale(user.location.countryCode);
          setDeliveryFromServer(user.location);
          bumpLocaleVersion();
        }
        if (user) {
          const orders = await fetchPreviousOrders();
          if (!cancelled) {
            setOrders(orders);
          }
        } else {
          setOrders([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setOrders([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bumpLocaleVersion, setDeliveryFromServer, setOrders, setUser]);
}
