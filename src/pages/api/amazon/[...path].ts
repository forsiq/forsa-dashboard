import type { NextApiRequest, NextApiResponse } from 'next';

const RAINFOREST_API_BASE = 'https://api.rainforestapi.com/request';
const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY;

/** Rainforest rejects combining `url` with `amazon_domain`; domain comes from the URL host. */
const DEFAULT_BESTSELLERS_URL: Record<string, string> = {
  'amazon.sa': 'https://www.amazon.sa/-/en/gp/bestsellers/electronics/',
  'amazon.com': 'https://www.amazon.com/gp/bestsellers/electronics/',
  'amazon.ae': 'https://www.amazon.ae/-/en/gp/bestsellers/electronics/',
};

function buildRainforestParams(
  pathSegments: string,
  queryParams: Record<string, string | string[] | undefined>
): Record<string, string> {
  const params: Record<string, string> = {
    api_key: RAINFOREST_API_KEY || '',
  };

  const segments = pathSegments.split('/');

  // /products/search?q=...&num=...&amazon_domain=...
  if (segments[0] === 'products' && segments[1] === 'search') {
    params.type = 'search';
    params.search_term = String(queryParams.q || '');
    params.amazon_domain = String(queryParams.amazon_domain || 'amazon.sa');
    if (queryParams.num) {
      params.number_of_results = String(queryParams.num);
    }
    return params;
  }

  // /products/bestsellers?category=...&num=...&amazon_domain=...
  if (segments[0] === 'products' && segments[1] === 'bestsellers') {
    params.type = 'bestsellers';
    const domain = String(queryParams.amazon_domain || 'amazon.sa');
    const category = queryParams.category ? String(queryParams.category) : 'aps';
    // `aps` / homepage-style category_id often returns an empty bestsellers list on regional stores.
    if (category === 'aps' || category === '') {
      const url = DEFAULT_BESTSELLERS_URL[domain] || DEFAULT_BESTSELLERS_URL['amazon.sa'];
      params.url = url;
    } else {
      params.amazon_domain = domain;
      params.category_id = category;
    }
    if (queryParams.num) {
      params.number_of_results = String(queryParams.num);
    }
    return params;
  }

  // /products/{asin}?amazon_domain=...
  if (segments[0] === 'products' && segments[1]) {
    params.type = 'product';
    params.asin = segments[1];
    params.amazon_domain = String(queryParams.amazon_domain || 'amazon.sa');
    return params;
  }

  return params;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!RAINFOREST_API_KEY) {
    console.error('RAINFOREST_API_KEY is not set');
    return res.status(500).json({
      error: 'Configuration error',
      message: 'RAINFOREST_API_KEY is not configured',
    });
  }

  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path || '';

  const rainforestParams = buildRainforestParams(pathSegments, req.query as Record<string, string | string[] | undefined>);

  const url = new URL(RAINFOREST_API_BASE);
  Object.entries(rainforestParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    console.log(`[Amazon Proxy] ${rainforestParams.type}: ${url.toString().replace(RAINFOREST_API_KEY, '***')}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Amazon Proxy] Rainforest API error: ${response.status}`, data);
      return res.status(response.status).json({
        error: 'Rainforest API error',
        message: data.error || `HTTP ${response.status}`,
        details: data,
      });
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('[Amazon Proxy] Request failed:', error.message);
    res.status(502).json({
      error: 'Amazon API proxy error',
      message: error.message,
    });
  }
}
