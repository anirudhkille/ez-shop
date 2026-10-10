import { useEffect, useRef, useState } from "react";

import {
  getMapboxSessionToken,
  isMapboxEnabled,
  retrieveAddress,
  suggestAddresses,
  type TMapboxSuggestion,
  type TResolvedAddress,
} from "../api/mapbox-geocode";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 3;

type UseAddressAutocomplete = {
  suggestions: TMapboxSuggestion[];
  isSearching: boolean;
  isResolving: boolean;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  resolveSuggestion: (
    suggestion: TMapboxSuggestion
  ) => Promise<TResolvedAddress>;
  reset: () => void;
};

export const useAddressAutocomplete = (
  query: string
): UseAddressAutocomplete => {
  const [suggestions, setSuggestions] = useState<TMapboxSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const sessionTokenRef = useRef<string>(getMapboxSessionToken());
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const reset = () => {
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    sessionTokenRef.current = getMapboxSessionToken();
    setSuggestions([]);
    setActiveIndex(-1);
    setIsOpen(false);
    setIsSearching(false);
    setIsResolving(false);
  };

  useEffect(() => {
    const trimmed = query.trim();

    if (!isMapboxEnabled || trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      abortRef.current = null;
      requestIdRef.current += 1;
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await suggestAddresses(
          trimmed,
          sessionTokenRef.current,
          controller.signal
        );
        if (requestIdRef.current !== requestId) return;
        setSuggestions(results);
      } catch {
        if (controller.signal.aborted) return;
        if (requestIdRef.current !== requestId) return;
        setSuggestions([]);
      } finally {
        if (requestIdRef.current === requestId) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const resolveSuggestion = async (
    suggestion: TMapboxSuggestion
  ): Promise<TResolvedAddress> => {
    setIsResolving(true);
    try {
      const resolved = await retrieveAddress(
        suggestion.mapboxId,
        sessionTokenRef.current
      );
      setSuggestions([]);
      setActiveIndex(-1);
      setIsOpen(false);
      return resolved;
    } finally {
      setIsResolving(false);
    }
  };

  return {
    suggestions,
    isSearching,
    isResolving,
    activeIndex,
    setActiveIndex,
    isOpen,
    setIsOpen,
    resolveSuggestion,
    reset,
  };
};
