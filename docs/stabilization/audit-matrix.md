# Auction-New Audit Matrix

This matrix tracks cross-page runtime and translation issues discovered during stabilization.

## Runtime Issues

| Area | File | Problem | Status |
| --- | --- | --- | --- |
| Sales routes | `src/features/sales/routes.tsx` | Missing review route and route path mismatch with page links | Fixed |
| Group buying list | `src/features/sales/pages/GroupBuyingListPage.tsx` | Uses `/group-buying/add` while route was `/group-buying/new` | Fixed |
| Group buying detail | `src/features/sales/pages/GroupBuyingDetailPage.tsx` | Uses `/group-buying/edit/:id` while route was `/group-buying/:id/edit` | Fixed |
| Item actions | `src/features/items/pages/ItemsListPage.tsx` | Item view linked to `/auctions/:id` | Fixed |
| Item edit flow | `src/features/items/pages/ItemFormPage.tsx` | Edit mode always called create mutation | Fixed |
| Auction bids query | `src/features/auctions/api/auction-hooks.ts` | Query key ignored page/limit | Fixed |
| Users page errors | `src/features/users/pages/UsersListPage.tsx` | Toast was called in render path | Fixed |
| User API mapping | `src/features/users/api/user-api.ts` | No snake_case to camelCase mapping caused broken table fields | Fixed |

## i18n Issues

| Area | File | Problem | Status |
| --- | --- | --- | --- |
| Users keys | `src/core/translations/locales/en/users.ts`, `src/core/translations/locales/ar/users.ts` | Missing `user.*` namespace used by pages | Fixed |
| Sales keys | `src/core/translations/locales/en/groupBuying.ts`, `src/core/translations/locales/ar/groupBuying.ts` | Missing `groupBuying.*` keys used by pages | Fixed |
| Common keys usage | `src/features/users/pages/UsersListPage.tsx`, `src/features/users/pages/UserFormPage.tsx` | Used `actions/cancel/saving` instead of `common.*` keys | Fixed |
| Hardcoded page fallback | `src/features/sales/pages/*` | Heavily hardcoded content still exists (non-blocking for first wave) | Partially mitigated with key coverage |

## Package/Test Issues

| Area | File | Problem | Status |
| --- | --- | --- | --- |
| Port mismatch | `package.json`, `vite.config.ts`, `.env` | Mixed local ports 4000/4001 | Fixed to 4001 |
| Duplicate Vite config | `vite.config.js` + `vite.config.ts` | Ambiguous source of truth | Fixed (`vite.config.ts` only) |
| Missing tests | `package.json` | No test harness/scripts | Fixed (Vitest + RTL scripts) |
| Missing test setup | `src/test/setup.ts` | No global test setup | Fixed |

