# CampusGo — React section (no build step)

The React order hub is mounted directly at `home.html`. `react-hub.html` remains as a compatibility
redirect for old bookmarks and links.

## Setup
1. Copy `react-hub.html`, the `react-hub/` folder and the `vendor/` folder into the project root
   (the same folder that has `style.css`, `index.html`, `home.html`).
2. Sign in on `index.html` as usual; Home opens the React order hub directly.
   (VS Code: right-click index.html > Open with Live Server. Double-clicking the file also works.)

## How React works here without npm
- `vendor/` has local copies of React, ReactDOM, htm (JSX-like template strings) and Zustand,
  so there is no build step, no Node, and it works offline.
- Files load in order: data.js -> state.js -> ui.js -> app.js, each adds to `window.CG`.

## Topic -> file
| Topic | Where |
|---|---|
| Context API | `state.js`: AuthProvider, ThemeProvider, ToastProvider (+ useAuth/useTheme/useToast) |
| Global vs local state | Global: Context + Zustand stores. Local: useState in pages/cards (filters, favourite, menu filters) |
| State architecture / derived state | `useCartTotals`, `useMemo` filters in `app.js`, order status computed in `data.js` |
| Zustand | `state.js`: useCartStore, useOrdersStore (persist middleware -> localStorage) |
| Async state, loading/error | `state.js` useAsync + `ui.js` LoadingBlock/ErrorBlock + `data.js` fake API |
| Mini project: shopping cart | `ui.js` QtyControl, CartFab, CartDrawer |
| Form handling + validation | `state.js` useForm + rules, used by the checkout form in `ui.js` |
| Reusable input components | `ui.js` FormField (input, select, textarea, password toggle) |
| Live tracking (React port of track-order.html) | `ui.js` DeliveryMap + PartnerCard, `app.js` OrderTracking, `data.js` getOrderProgress |
| Effects / cleanup | useNow (setInterval), useHashRoute (hashchange listener), useAsync (cancel flag) |

## Limits to mention
- Same as the main site: no backend, data lives in localStorage (per browser).
- Order status is simulated from elapsed time (12x speed: ~100 s for a full order).
- Login is the existing vanilla login; the React page just reads its `cg_session`.

## Live tracking: how it works (for the viva)
- ONE source of truth: `placedAt` (when the order was placed). `getOrderProgress(order, now)` turns that into
  stage, minutes left and deliveryProgress (0..1). Nothing else is stored.
- `useNow(1000)` re-renders every second, so the countdown, stepper, distance and marker all update together.
- `DeliveryMap` places the marker with `path.getPointAtLength(progress * path.getTotalLength())` inside `useEffect`.
- "Preview approach" calls the store action `fastForward`, which moves `placedAt` so the order is "Ready" and the delivery leg plays.
- A `useEffect` fires a toast once when the order flips to delivered.
- `#/track` opens your latest order; if you have none it offers a one-click demo order.
