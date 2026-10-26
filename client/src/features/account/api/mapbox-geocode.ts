import type { TApiResponse } from "@/shared/lib/api-response";
import { axiosInstance } from "@/shared/lib/axios-instance";

const MIN_QUERY_LENGTH = 3;
const REQUEST_TIMEOUT_MS = 10_000;

export type TMapboxSuggestion = {
  mapboxId: string;
  primaryText: string;
  secondaryText: string;
  fullAddress: string;
  featureType: string;
};

export type TResolvedAddress = {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export const getMapboxSessionToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ez-shop-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const suggestAddresses = async (
  query: string,
  sessionToken: string,
  signal?: AbortSignal
): Promise<TMapboxSuggestion[]> => {
  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const response = await axiosInstance.get<TApiResponse<TMapboxSuggestion[]>>(
    "/mapbox/suggest",
    {
      params: { q: trimmed, sessionToken },
      signal,
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  return response.data.data;
};

export const retrieveAddress = async (
  mapboxId: string,
  sessionToken: string
): Promise<TResolvedAddress> => {
  const response = await axiosInstance.get<TApiResponse<TResolvedAddress>>(
    `/mapbox/retrieve/${encodeURIComponent(mapboxId)}`,
    { params: { sessionToken }, timeout: REQUEST_TIMEOUT_MS }
  );

  return response.data.data;
};
