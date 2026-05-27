/**
 * src/hooks/index.ts
 * All custom hooks for Wealth Curator.
 * Exports: useFetch, useAnalytics, useDebounce, useLocalStorage
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Mock data resolver — maps "mock:<filename>" to the JSON in src/data/
// ---------------------------------------------------------------------------
const MOCK_DATA: Record<string, () => Promise<unknown>> = {
  transactions: () => import("../data/transactions.json").then((m) => m.default),
  summary: () => import("../data/summary.json").then((m) => m.default),
  insights: () => import("../data/insights.json").then((m) => m.default),
  portfolio: () => import("../data/portfolio.json").then((m) => m.default),
  alerts: () => import("../data/alerts.json").then((m) => m.default),
};

async function resolveMockData(mockKey: string): Promise<unknown> {
  const loader = MOCK_DATA[mockKey];
  if (!loader) throw new Error(`No mock data found for key: "${mockKey}"`);
  // Simulate realistic 600ms API latency
  await new Promise((r) => setTimeout(r, 600));
  return loader();
}

// ---------------------------------------------------------------------------
// useFetch — Generic data fetching with abort, retry (max 3), mock support
// ---------------------------------------------------------------------------
export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseFetchOptions {
  /** Initial data to show before first fetch */
  initialData?: unknown;
  /** Custom fetch request init options (ignored in mock mode) */
  requestInit?: RequestInit;
}

export function useFetch<T = unknown>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchState<T> {
  const [data, setData] = useState<T | null>((options.initialData as T) ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const isMock = url.startsWith("mock:");

    const fetchWithRetry = async (attempt: number): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        let result: T;

        if (isMock) {
          // Mock mode — resolve from local JSON with simulated delay
          const mockKey = url.slice("mock:".length);
          result = (await resolveMockData(mockKey)) as T;
        } else {
          // Real fetch mode
          const response = await fetch(url, {
            ...options.requestInit,
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          result = (await response.json()) as T;
        }

        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        // AbortError means component unmounted — don't update state
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (attempt < 3) {
          // Retry with exponential back-off: 500ms, 1000ms, 2000ms
          await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)));
          if (!cancelled) return fetchWithRetry(attempt + 1);
        } else {
          const message =
            err instanceof Error ? err.message : "An unknown error occurred";
          if (!cancelled) {
            setError(message);
            setLoading(false);
          }
        }
      }
    };

    fetchWithRetry(1);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch };
}

// ---------------------------------------------------------------------------
// useAnalytics — GA4 event tracking with GTM dataLayer support
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface AnalyticsHook {
  trackEvent: (category: string, action: string, label?: string, value?: number) => void;
  trackPageView: (pageName: string) => void;
  trackCTA: (ctaName: string, context?: Record<string, unknown>) => void;
}

export function useAnalytics(): AnalyticsHook {
  // Push event to GA4 gtag and GTM dataLayer simultaneously
  const pushEvent = useCallback(
    (eventName: string, params: Record<string, unknown> = {}) => {
      // GA4 via gtag — gracefully no-ops if not loaded
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
      }

      // GTM dataLayer push — gracefully no-ops if GTM not present
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push({ event: eventName, ...params });
      }
    },
    []
  );

  const trackEvent = useCallback(
    (category: string, action: string, label?: string, value?: number) => {
      pushEvent(action, {
        event_category: category,
        ...(label !== undefined && { event_label: label }),
        ...(value !== undefined && { value }),
      });
    },
    [pushEvent]
  );

  const trackPageView = useCallback(
    (pageName: string) => {
      pushEvent("page_view", { page_title: pageName, page_location: typeof window !== "undefined" ? window.location.href : "" });
    },
    [pushEvent]
  );

  const trackCTA = useCallback(
    (ctaName: string, context: Record<string, unknown> = {}) => {
      pushEvent("cta_click", { cta_name: ctaName, ...context });
    },
    [pushEvent]
  );

  return { trackEvent, trackPageView, trackCTA };
}

// ---------------------------------------------------------------------------
// useDebounce — Standard debounce hook. Used for search input filtering.
// ---------------------------------------------------------------------------
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ---------------------------------------------------------------------------
// useLocalStorage — Persists state to localStorage like useState.
// Used for: dark mode preference, selected currency, sidebar collapsed state.
// ---------------------------------------------------------------------------
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // Silently ignore JSON parse errors and return the initial value
      return initialValue;
    }
  });

  const prevKeyRef = useRef(key);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          typeof value === "function"
            ? (value as (prev: T) => T)(storedValue)
            : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // Silently ignore localStorage errors (e.g. storage quota exceeded)
      }
    },
    [key, storedValue]
  );

  // Sync across tabs via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // Silently ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  // Re-read from localStorage if key changes
  useEffect(() => {
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) setStoredValue(JSON.parse(item) as T);
      } catch {
        // Silently ignore
      }
    }
  }, [key]);

  return [storedValue, setValue];
}
