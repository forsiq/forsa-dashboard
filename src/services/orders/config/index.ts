import { createCrudService } from '@core/services';
import type { CrudServiceConfig } from '@core/services';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderFilters } from '../types';
import { orderEntityMeta } from './entity.schema';
import { orderListConfig } from './list.config';
import { orderFormConfig } from './form.config';

export const orderServiceConfig: CrudServiceConfig = {
  name: 'orders',
  endpoint: '/api/v1/orders',
};

export const orderService = createCrudService<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>(orderServiceConfig);

export type { Order, CreateOrderInput, UpdateOrderInput, OrderFilters };
export { orderEntityMeta, orderListConfig, orderFormConfig };
export default orderService;
