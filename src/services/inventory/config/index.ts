import { createCrudService } from '@core/services';
import type { CrudServiceConfig } from '@core/services';
import type { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '../types';
import { inventoryEntityMeta } from './entity.schema';
import { inventoryListConfig } from './list.config';
import { productFormConfig } from './form.config';

export const inventoryServiceConfig: CrudServiceConfig = {
  name: 'inventory',
  endpoint: '/api/v1/inventory',
};

export const inventoryService = createCrudService<Product, CreateProductInput, UpdateProductInput, ProductFilters>(inventoryServiceConfig);

export type { Product, CreateProductInput, UpdateProductInput, ProductFilters };
export { inventoryEntityMeta, inventoryListConfig, productFormConfig };
export default inventoryService;
