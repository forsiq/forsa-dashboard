import { createCrudService } from '@core/services';
import type { CrudServiceConfig } from '@core/services';
import type { Report, ReportFilters } from './entity.schema';
import { reportsEntityMeta } from './entity.schema';
import { reportListConfig } from './list.config';
import { reportFormConfig } from './form.config';

export const reportsServiceConfig: CrudServiceConfig = {
  name: 'reports',
  endpoint: '/api/v1/reports',
};

export const reportsService = createCrudService<Report, never, never, ReportFilters>(reportsServiceConfig);

export type { Report, ReportFilters };
export { reportsEntityMeta, reportListConfig, reportFormConfig };
export default reportsService;
