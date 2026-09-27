import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

/**
 * The auth session lives in a feature store, but this module is shared
 * infrastructure and must not depend on a feature. The owning feature injects
 * a bridge at startup (see main.tsx) instead.
 */
export interface AuthBridge {
  getToken: () => string | null;
  /** Persists a rotated access token after a successful refresh. */
  setToken: (token: string) => void;
  /** Clears the session when a refresh fails. */
  clearSession: () => void;
}

let auth: AuthBridge | null = null;

export function setAuthBridge(bridge: AuthBridge): void {
  auth = bridge;
}

interface RefreshEnvelope {
  success: boolean;
  message: string;
  data?: { token: string };
}

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing: boolean = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (token: string): void => {
  failedQueue.forEach((prom) => {
    prom.resolve(token);
  });
  failedQueue = [];
};

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: AxiosError) => void
): void => {
  failedQueue.push({ resolve, reject });
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = auth?.getToken();

    if (token && !config.url?.includes("/refresh")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;
    const { status } = error.response || {};

    // Only 401 means the token is no longer valid. A 403 is a legitimate
    // "authenticated but not allowed" response, and treating it as an expiry
    // signs the user out for hitting a route they cannot access.
    if (status === 401 && auth?.getToken()) {
      if (originalRequest.url?.includes("/refresh")) {
        auth.clearSession();
        return Promise.reject(error);
      }

      return new Promise<AxiosInstance>((resolve, reject) => {
        subscribeTokenRefresh(
          (token: string) => {
            resolve(
              axiosInstance({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${token}`,
                },
              })
            );
          },
          (err: AxiosError) => {
            reject(err);
          }
        );

        if (!isRefreshing) {
          isRefreshing = true;

          axiosInstance
            .get<RefreshEnvelope>(`/user/refresh`)
            .then((res) => {
              const newAccessToken = res.data.data?.token;
              if (!newAccessToken) {
                throw new Error("Refresh response did not include a token");
              }
              auth?.setToken(newAccessToken);

              processQueue(newAccessToken);
            })
            .catch((err: AxiosError) => {
              auth?.clearSession();
              failedQueue.forEach((prom) => prom.reject(err));
              failedQueue = [];
              return Promise.reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        }
      }) as Promise<unknown>;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
