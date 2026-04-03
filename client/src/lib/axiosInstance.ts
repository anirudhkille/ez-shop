import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import useAuthStore from "@/store/userStore";

interface RefreshResponse {
  token: string;
  refreshToken: string;
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
    const authState = useAuthStore.getState();
    const token = authState.token;

    if (token) {
      if (!config.url?.includes("/refresh")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    const authStore = useAuthStore.getState();

    if ((status === 401 || status === 403) && authStore.token) {
      if (originalRequest.url?.includes("/refresh")) {
        authStore.logout();
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
            .get<RefreshResponse>(`/user/refresh`)
            .then((res) => {
              const { token: newAccessToken } = res.data;
console.log("Token refreshed successfully");
              authStore.setUser({
                token: newAccessToken,
              });

              processQueue(newAccessToken);

              // Resolve the currently handled promise with the successful result of the retried request
              return axiosInstance({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });
            })
            .catch((err: AxiosError) => {
              authStore.logout();
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
