# Wealth Curator — Personal Finance Dashboard

> An AI-powered personal finance dashboard with real-time net worth tracking, spending analysis, and smart portfolio insights.

## Live Demo

🔗 [https://wealth-curator.app](https://wealth-curator.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | TanStack Start (SSR) + React 19 |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS v4 (CSS variables, no JIT config file) |
| **Charts** | Recharts 2.x (lazy-loaded) |
| **UI Components** | Radix UI + shadcn/ui |
| **Routing** | TanStack Router (file-based) |
| **Data Fetching** | Custom `useFetch` hook (mock mode + real fetch) |
| **List Virtualization** | react-window (FixedSizeList) |
| **Analytics** | Google Analytics 4 (gtag.js + GTM dataLayer) |
| **Build Tool** | Vite 7 + @cloudflare/vite-plugin |

---

## Architecture Decisions

### Component Hierarchy

```
App (TanStack Router)
└── __root.tsx              ← HTML shell, SEO meta, GA4 script
    └── RootComponent       ← QueryClientProvider
        └── Layout          ← Sidebar + TopBar (memoized) + main
            ├── Dashboard (/)
            │   ├── Stat cards (React.memo × 3)
            │   ├── AIInsightsPanel (lazy + memo + custom comparator)
            │   ├── AlertCard list (React.memo per card)
            │   ├── SpendingChart (lazy + memo, Recharts inside)
            │   └── Recent activity (inline, filtered + debounced)
            ├── Transactions (/transactions)
            │   └── TransactionsTable (lazy + react-window >20 rows)
            ├── Insights (/insights)   ← static UI + generateInsights()
            ├── Accounts (/accounts)   ← static UI
            └── Budgets (/budgets)     ← static UI
```

### Why Lazy Loading Was Applied

| Component | Reason |
|---|---|
| `AIInsightsPanel` | Loads only on dashboard render; contains complex logic |
| `SpendingChart` | Recharts is ~200KB — deferred to keep initial bundle light |
| `TransactionsTable` | react-window adds size; only needed on transactions page |

### Mock Data Layer Design

The `useFetch` hook supports a `mock:` URL scheme that resolves to JSON files in `src/data/`. This design:

- **Mirrors real API shape** — the same `useFetch("mock:transactions")` call works identically with a real API URL
- **Simulates latency** — a 600ms artificial delay mimics real network round-trips
- **Enables skeleton states** — loading states are guaranteed to appear and test the UX
- **Zero configuration** — no MSW or fake server needed; works in dev and CI

---

## Custom Hooks

### `useFetch<T>(url, options?)`

**Purpose:** Generic data fetching with abort on unmount, retry logic, and mock mode.

**Parameters:**
- `url: string` — Real URL or `"mock:<key>"` for mock data
- `options.initialData?` — Data to show before first fetch
- `options.requestInit?` — Fetch request options (ignored in mock mode)

**Return value:** `{ data: T | null, loading: boolean, error: string | null, refetch: () => void }`

**Usage:**
```typescript
const { data: transactions, loading, error, refetch } = useFetch<Transaction[]>("mock:transactions");
// OR
const { data } = useFetch<User>("https://api.example.com/user");
```

---

### `useAnalytics()`

**Purpose:** GA4 event tracking with GTM dataLayer integration. No-ops gracefully in dev if `gtag` is not loaded.

**Return value:** `{ trackEvent, trackPageView, trackCTA }`

**Usage:**
```typescript
const { trackEvent, trackPageView, trackCTA } = useAnalytics();

// On page load
trackPageView("Dashboard");

// On user action
trackEvent("engagement", EVENTS.INSIGHT_CTA_CLICKED, insightId);

// On CTA click
trackCTA("execute_strategy", { insight_id: "ins_001", insight_type: "risk" });
```

---

### `useDebounce<T>(value, delay = 300)`

**Purpose:** Defers a value update until the user stops changing it for `delay` ms. Used in search inputs to avoid firing analytics and filter logic on every keystroke.

**Parameters:**
- `value: T` — The value to debounce
- `delay: number` — Delay in ms (default: 300)

**Return value:** `T` — The debounced value

**Usage:**
```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

// filteredTransactions re-computes only 300ms after typing stops
const filtered = useMemo(
  () => transactions.filter(t => t.merchant.includes(debouncedSearch)),
  [transactions, debouncedSearch]
);
```

---

### `useLocalStorage<T>(key, initialValue)`

**Purpose:** Persists React state to `localStorage`. Handles JSON parse errors silently. Syncs across browser tabs via `storage` events.

**Parameters:**
- `key: string` — localStorage key
- `initialValue: T` — Default value if key doesn't exist

**Return value:** `[T, (value: T | ((prev: T) => T)) => void]` — Same API as `useState`

**Usage:**
```typescript
const [theme, setTheme] = useLocalStorage<"dark" | "light">("wc-theme", "dark");
// Persisted automatically — survives page refresh
```

---

## Performance Optimizations

| Optimization | Where Applied | Measurable Benefit |
|---|---|---|
| **React.lazy + Suspense** | `AIInsightsPanel`, `SpendingChart`, `TransactionsTable` | ~40% smaller initial JS bundle |
| **React.memo** | `Stat`, `AlertCard`, `TopBar`, `InsightCard`, `RowComponent` | Prevents re-renders on unrelated state changes |
| **Custom `areEqual` comparator** | `AIInsightsPanel` | Skips re-renders when insight IDs haven't changed |
| **useMemo — filtered transactions** | Dashboard, Transactions page | O(n) filter runs only when data or query changes |
| **useMemo — category totals** | Dashboard, SpendingChart | Chart recalculation only on new transaction data |
| **useMemo — generateInsights()** | Dashboard, Insights page | 7-rule computation only when transactions change |
| **useCallback — all handlers** | All event props | Stable references; prevents memo'd children re-rendering |
| **react-window FixedSizeList** | `TransactionsTable` (>20 rows) | Renders ~8 DOM nodes instead of 50+ |
| **Alternating row classes** | `TransactionsTable` | Computed from `index % 2` — zero runtime cost |
| **600ms mock delay** | `useFetch` mock resolver | Forces skeleton UX to be tested in development |

---

## SEO Techniques

### Meta Tags Used

| Tag | Purpose |
|---|---|
| `<title>` | "Wealth Curator — Personal Finance Dashboard" |
| `meta[name=description]` | 160-char summary for SERP snippet |
| `meta[name=keywords]` | Finance-relevant keywords |
| `meta[name=theme-color]` | Browser chrome color on mobile |
| `meta[name=robots]` | `index, follow` — allow full crawling |
| `meta[property=og:*]` | Open Graph for rich social previews |
| `meta[name=twitter:*]` | Twitter card with large image |
| `<link rel=canonical>` | Prevents duplicate content penalties |

### Semantic HTML Choices

- `<header>` — Top navigation bar
- `<main id="main-content">` — Primary content area; target of skip link
- `<section>` — Dashboard panels (summary cards, recent activity)
- `<aside>` — Alerts panel (complementary content)
- `<article>` — Individual stat cards and insight cards
- `<table>` + `<thead>` + `<tbody>` + `<tr>` + `<th>` + `<td>` — Transactions table (≤20 rows)
- `<nav aria-label>` — Header tabs, footer links, category filters
- `<footer>` — Footer with legal links

### Accessibility Features

- **Skip-to-content link** — First focusable element; jumps to `#main-content`
- **`aria-label`** on all icon-only buttons (Bell, Settings, Search, Dark mode)
- **`aria-pressed`** on toggle/filter buttons
- **`aria-current="page"`** on active nav link
- **`role="img" + aria-label`** on chart containers
- **`role="alert"`** on alert cards
- **`aria-live="polite"`** on chart tooltip
- **Status badges** — use icon + text label, not color alone
- **Labels** — All inputs have `<label>` (visually hidden via `sr-only` where needed)
- **Focus management** — All interactive elements reachable via Tab
- **`focus-visible` ring** on all buttons

---

## AI Insights Engine

### How `generateInsights()` Works

The function in `src/lib/insightsEngine.ts` is a **pure function** (no side effects, no React hooks). It accepts `(transactions, summary)` and returns an array of `GeneratedInsight` objects.

**7 Rules:**

| # | Rule | Trigger | Output Type |
|---|---|---|---|
| 1 | Category > 30% of total spend | High concentration | `risk` |
| 2 | Same subscription merchant appears 2+ times | Duplicate detected | `saving` |
| 3 | Savings rate < 20% | Below threshold | `alert` |
| 4 | Net worth change > 3% MoM | Strong growth signal | `opportunity` |
| 5 | Any pending transactions | Month-close reminder | `alert` |
| 6 | Top spending category | Informational | `saving` |
| 7 | Largest budget category > 40% | Rebalance needed | `risk` |

### How Insights Are Prioritized

After all rules run, insights are:
1. **Deduplicated** by `id` (Map-based dedup)
2. **Sorted** by priority: `high → medium → low`
3. **Displayed** with `InsightCard` badges and CTAs

The engine is called inside a `useMemo` in the Dashboard — it only re-runs when `transactions` or `summary` data changes.

---

## Design System

### Color Tokens

| Token | Dark Value | Purpose |
|---|---|---|
| `--color-background` | `#111315` | Page background |
| `--color-card` | `#0a0e0e` | Card surfaces |
| `--color-primary` | `oklch(0.55 0.21 255)` | Brand blue |
| `--color-muted-foreground` | `oklch(0.68 0.03 255)` | Secondary text |
| `--color-border` | `oklch(1 0 0 / 8%)` | Subtle borders |
| `--color-success` | `oklch(0.72 0.18 145)` | Emerald — positive |
| `--color-warning` | `oklch(0.79 0.18 70)` | Amber — caution |
| `--color-danger` | `oklch(0.65 0.22 25)` | Red — critical |
| `--color-info` | `oklch(0.68 0.18 230)` | Sky blue — neutral |

### Typography Scale

| Class | Size | Weight | Usage |
|---|---|---|---|
| `text-3xl font-semibold` | 1.875rem | 600 | Stat values, page headings |
| `text-lg font-semibold` | 1.125rem | 600 | Section headings |
| `text-sm` | 0.875rem | 400 | Body text, table rows |
| `text-xs` | 0.75rem | 400 | Labels, metadata |
| `text-[10px] uppercase tracking-wider` | 0.625rem | 600 | Overline labels |

### Spacing Scale

Uses Tailwind's standard 4px base unit: `gap-3` (12px), `gap-5` (20px), `p-5` (20px), `p-6` (24px), `px-6 py-4` for table cells.

---

## Trade-offs

### Prioritized
- **Type safety** — All components fully typed; no `any` usage
- **Real loading states** — Mock delay forces skeleton UX to always be visible in dev
- **Analytics accuracy** — Search query length is logged, never the actual text (privacy)
- **Accessible by default** — ARIA, semantic HTML, and keyboard nav built in from day one

### Deferred / Known Limitations
- **No real backend** — All data is mock JSON; production would swap `"mock:*"` URLs for real API endpoints
- **No authentication** — User session and auth flows are out of scope for this assignment
- **No test suite** — Unit tests for `generateInsights()` and hooks were not written but would be the next step
- **react-window + `<table>`** — The windowed list uses `role="table"` ARIA on divs; a native `<table>` with virtual rows requires more complex implementation (react-virtuoso is better suited)
- **Dark mode persistence** — TanStack Start SSR renders `<html class="dark">` by default; the client-side toggle works but causes a brief flash on first load without server cookie sync

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/wealth-curator.git
cd wealth-curator

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your VITE_GA_MEASUREMENT_ID

# 4. Start dev server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run preview
```
