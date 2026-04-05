/**
 * Reports GraphQL Queries
 */

export const GET_REPORTS_QUERY = `
  query GetReports($period: String) {
    reports(period: $period) {
      totalSales
      totalOrders
      averageOrderValue
      growth
      period
    }
  }
`;

export const GET_ANALYTICS_QUERY = `
  query GetAnalytics($service: String) {
    analytics(service: $service) {
      sales {
        date
        value
      }
      orders {
        date
        value
      }
      visitors {
        date
        value
      }
      conversion
    }
  }
`;

export const GET_SALES_REPORT_QUERY = `
  query GetSalesReport($period: String) {
    salesReport(period: $period) {
      products {
        name
        sales
        revenue
      }
      categories {
        name
        sales
        revenue
      }
      topCustomers {
        name
        email
        spent
      }
    }
  }
`;
