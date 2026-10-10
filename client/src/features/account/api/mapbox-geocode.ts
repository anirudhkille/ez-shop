const SUGGEST_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";

const MIN_QUERY_LENGTH = 3;
const SUGGEST_LIMIT = 6;
const REQUEST_TIMEOUT_MS = 10_000;
const ADDRESS_TYPES = "address,street";

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

export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

export const isMapboxEnabled = Boolean(mapboxToken);

export const getMapboxSessionToken = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ez-shop-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const withSessionToken = (params: URLSearchParams, sessionToken: string) => {
  params.set("session_token", sessionToken);
  params.set("access_token", mapboxToken ?? "");
  return params;
};

const requestJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Mapbox request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

export const suggestAddresses = async (
  query: string,
  sessionToken: string,
  signal?: AbortSignal
): Promise<TMapboxSuggestion[]> => {
  const trimmed = query.trim();
  if (!isMapboxEnabled || trimmed.length < MIN_QUERY_LENGTH) return [];

  const params = withSessionToken(
    new URLSearchParams({
      q: trimmed,
      language: "en",
      limit: String(SUGGEST_LIMIT),
      types: ADDRESS_TYPES,
    }),
    sessionToken
  );

  const data = await requestJson<MapboxSuggestResponse>(
    new URL(`${SUGGEST_URL}?${params.toString()}`),
    signal
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
  sessionToken: string
): Promise<TResolvedAddress> => {
  if (!isMapboxEnabled) {
    throw new Error("Mapbox is not configured");
  }

  const params = withSessionToken(new URLSearchParams(), sessionToken);
  const url = new URL(`${RETRIEVE_URL}/${encodeURIComponent(mapboxId)}`);
  url.search = params.toString();

  const data = await requestJson<MapboxRetrieveResponse>(url);
  const properties = data.features?.[0]?.properties;

  if (!properties) {
    throw new Error("Mapbox returned no address details");
  }

  const context = properties.context ?? {};
  const city = context.place?.name ?? context.locality?.name ?? "";
  const state = context.region?.name ?? context.region?.region_code ?? "";

  return {
    addressLine1: properties.address ?? properties.name ?? "",
    city,
    state,
    zipCode: context.postcode?.name ?? "",
    country: context.country?.name ?? "",
  };
};
