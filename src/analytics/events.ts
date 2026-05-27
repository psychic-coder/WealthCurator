/**
 * src/analytics/events.ts
 * Named event constants for GA4 + GTM dataLayer integration.
 * Import EVENTS to fire analytics events consistently across the app.
 */

// ---------------------------------------------------------------------------
// Event name constants — single source of truth for all analytics events
// ---------------------------------------------------------------------------
export const EVENTS = {
  DASHBOARD_LOADED: "dashboard_loaded",
  SEARCH_USED: "search_used",
  FILTER_CHANGED: "filter_changed",
  INSIGHT_CTA_CLICKED: "insight_cta_clicked",
  ALERT_DISMISSED: "alert_dismissed",
  TAB_CHANGED: "tab_changed",
  DARK_MODE_TOGGLED: "dark_mode_toggled",
  PAGE_VIEW: "page_view",
  CTA_CLICK: "cta_click",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// ---------------------------------------------------------------------------
// GTM DataLayer push wrapper
// Sends events to GTM dataLayer if GTM is present, in addition to gtag.
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushDataLayer(
  event: string,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    timestamp: new Date().toISOString(),
    ...params,
  });
}

// ---------------------------------------------------------------------------
// Typed event payload helpers — ensure correct shape at call sites
// ---------------------------------------------------------------------------

/** Fires when the main dashboard component mounts */
export function firesDashboardLoaded(): Record<string, unknown> {
  return { event_category: "lifecycle", event_label: "initial_load" };
}

/** Fires on debounced search — never logs actual query text, only length */
export function firesSearchUsed(queryLength: number): Record<string, unknown> {
  return { event_category: "search", query_length: queryLength };
}

/** Fires when transaction category filter changes */
export function firesFilterChanged(filterValue: string): Record<string, unknown> {
  return { event_category: "filter", filter_value: filterValue };
}

/** Fires when "Execute Strategy" CTA is clicked */
export function firesInsightCTAClicked(
  insightId: string,
  insightType: string
): Record<string, unknown> {
  return {
    event_category: "engagement",
    insight_id: insightId,
    insight_type: insightType,
  };
}

/** Fires when an alert is dismissed */
export function firesAlertDismissed(
  alertId: string,
  severity: string
): Record<string, unknown> {
  return { event_category: "alerts", alert_id: alertId, severity };
}

/** Fires when navigation tab changes */
export function firesTabChanged(tabName: string): Record<string, unknown> {
  return { event_category: "navigation", tab_name: tabName };
}

/** Fires when dark mode is toggled */
export function firesDarkModeToggled(enabled: boolean): Record<string, unknown> {
  return { event_category: "preferences", enabled };
}
