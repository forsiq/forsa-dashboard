// Arabic translations - merged from all feature files
import { common } from './common';
import { sidebar } from './sidebar';
import { navigation } from './navigation';
import { auth } from './auth';
import { categories } from './categories';
import { customers } from './customers';
import { orders } from './orders';
import { reports } from './reports';
import { inventory } from './inventory';
import { settings } from './settings';
import { services } from './services';
import { billing } from './billing';
import { auction } from './auction';
import { repairpro } from './repairpro';
import { portal } from './portal';
import { dashboard } from './dashboard';
import { products } from './products';
import { projects } from './projects';
import { users } from './users';
import { admin } from './admin';
import { compute } from './compute';
import { crm } from './crm';
import { finance } from './finance';
import { misc } from './misc';
import { ui } from './ui';
import { groupBuying } from './groupBuying';
import { sales } from './sales';

export const ar = {
  ...common,
  ...sidebar,
  ...navigation,
  ...auth,
  ...categories,
  ...customers,
  ...orders,
  ...reports,
  ...inventory,
  ...settings,
  ...services,
  ...billing,
  ...auction,
  ...repairpro,
  ...portal,
  ...dashboard,
  ...products,
  ...projects,
  ...users,
  ...admin,
  ...compute,
  ...crm,
  ...finance,
  ...misc,
  ...ui,
  ...groupBuying,
  ...sales,
} as const;
