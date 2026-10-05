import { useUserStore } from "@/features/auth";
import { setAuthBridge } from "@/shared/lib/axios-instance";

import { setSentryUser } from "../sentry";

export function initSessionBridge() {
  setAuthBridge({
    getToken: () => useUserStore.getState().token ?? null,
    setToken: (token) => useUserStore.getState().setUser({ token }),
    clearSession: () => useUserStore.getState().logout(),
  });

  useUserStore.subscribe((state) => {
    setSentryUser(state.token ? { id: state.email ?? "unknown" } : null);
  });
}
