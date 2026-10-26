import { env } from "@/config/env.config";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/app-error";

const SUGGEST_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";

const MIN_QUERY_LENGTH = 3;
const SUGGEST_LIMIT = 6;
const REQUEST_TIMEOUT_MS = 10_000;
const ADDRESS_TYPES = "address,street";

export type MapboxSuggestion = {
  mapboxId: string;
  primaryText: string;
  secondaryText: string;
  fullAddress: string;
  featureType: string;
};

export type ResolvedAddress = {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

type MapboxContextLayer = {
  name?: string;
  region_code?: string;
};

type MapboxFeature = {
  properties?: {
    name?: string;
    address?: string;
    context?: {
      country?: MapboxContextLayer;
      region?: MapboxContextLayer;
      postcode?: MapboxContextLayer;
      place?: MapboxContextLayer;
      locality?: MapboxContextLayer;
    };
  };
};

type MapboxSuggestResponse = {
  suggestions?: Array<{
    mapbox_id?: string;
    name?: string;
    name_preferred?: string;
    feature_type?: string;
    address?: string;
    full_address?: string;
    place_formatted?: string;
  }>;
};

type MapboxRetrieveResponse = {
  features?: MapboxFeature[];
};

const requestJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    logger.warn({ status: response.status }, "Mapbox request failed");
    throw new AppError("Address lookup is temporarily unavailable", 502);
  }

  return (await response.json()) as T;
};

const withSession = (params: URLSearchParams, sessionToken: string) => {
  params.set("session_token", sessionToken);
  params.set("access_token", env.MAPBOX_TOKEN);
  return params;
};

export const suggestAddresses = async (
  query: string,
  sessionToken: string,
): Promise<MapboxSuggestion[]> => {
  if (!env.MAPBOX_TOKEN) return [];

  const trimmed = query.trim();

  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  const params = withSession(
    new URLSearchParams({
      q: trimmed,
      language: "en",
      limit: String(SUGGEST_LIMIT),
      types: ADDRESS_TYPES,
    }),
    sessionToken,
  );

  const data = await requestJson<MapboxSuggestResponse>(
    new URL(`${SUGGEST_URL}?${params.toString()}`),
  );

  return (data.suggestions ?? [])
    .filter((suggestion) => suggestion.mapbox_id)
    .map((suggestion) => ({
      mapboxId: suggestion.mapbox_id as string,
      primaryText: suggestion.name_preferred ?? suggestion.name ?? "",
      secondaryText: suggestion.place_formatted ?? "",
      fullAddress: suggestion.full_address ?? suggestion.name ?? "",
      featureType: suggestion.feature_type ?? "",
    }))
    .filter((suggestion) => suggestion.primaryText.length > 0);
};

export const retrieveAddress = async (
  mapboxId: string,
  sessionToken: string,
): Promise<ResolvedAddress> => {
  if (!env.MAPBOX_TOKEN) {
    throw new AppError("Address lookup is not configured", 503);
  }

  const params = withSession(new URLSearchParams(), sessionToken);
  const url = new URL(`${RETRIEVE_URL}/${encodeURIComponent(mapboxId)}`);
  url.search = params.toString();

  const data = await requestJson<MapboxRetrieveResponse>(url);
  const properties = data.features?.[0]?.properties;

  if (!properties) {
    throw new AppError("Address details not found", 404);
  }

  const context = properties.context ?? {};

  return {
    addressLine1: properties.address ?? properties.name ?? "",
    city: context.place?.name ?? context.locality?.name ?? "",
    state: context.region?.name ?? context.region?.region_code ?? "",
    zipCode: context.postcode?.name ?? "",
    country: context.country?.name ?? "",
  };
};
