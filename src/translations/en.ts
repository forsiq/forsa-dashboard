// EN root translations — barrel merge of all feature modules.
// Source of truth now lives under src/translations/features/en/.
// To add a key, append it to the relevant feature file in that folder.

import { account, approvals, auctions, auth, categories, common, customers, feedback, group_buying, help, inventory, invoice, listings, merchants, moderation, navigation, notifications, orders, reports, sales, service_desk, settlements, shipping, support, toasts } from './features/en';

export const en: Record<string, string> = {
  ...account,
  ...approvals,
  ...auctions,
  ...auth,
  ...categories,
  ...common,
  ...customers,
  ...feedback,
  ...group_buying,
  ...help,
  ...inventory,
  ...invoice,
  ...listings,
  ...merchants,
  ...moderation,
  ...navigation,
  ...notifications,
  ...orders,
  ...reports,
  ...sales,
  ...service_desk,
  ...settlements,
  ...shipping,
  ...support,
  ...toasts,
};
