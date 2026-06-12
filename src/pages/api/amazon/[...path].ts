import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import dns from 'dns';

const RAINFOREST_API_BASE = 'https://api.rainforestapi.com/request';
const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY;
const RAINFOREST_HOST = 'api.rainforestapi.com';

const RAINFOREST_TIMEOUT = 120_000;

/** Cached DNS lookup result to avoid repeated slow lookups */
let cachedIp: string | null = null;
let cachedAt = 0;
const DNS_CACHE_TTL = 60_000; // Re-resolve every 60s

/** Rainforest rejects combining `url` with `amazon_domain`; domain comes from the URL host. */
const DEFAULT_BESTSELLERS_URL: Record<string, string> = {
  'amazon.sa': 'https://www.amazon.sa/gp/bestsellers/electronics/',
  'amazon.com': 'https://www.amazon.com/gp/bestsellers/electronics/',
  'amazon.ae': 'https://www.amazon.ae/gp/bestsellers/electronics/',
};

function resolveIp(): Promise<string> {
  const now = Date.now();
  if (cachedIp && now - cachedAt < DNS_CACHE_TTL) {
    return Promise.resolve(cachedIp);
  }

  return new Promise((resolve, reject) => {
    dns.resolve4(RAINFOREST_HOST, (err, addresses) => {
      if (err) {
        if (cachedIp) return resolve(cachedIp);
        return reject(err);
      }
      cachedIp = addresses[0];
      cachedAt = now;
      resolve(cachedIp!);
    });
  });
}

const DOMAIN_LANGUAGE_MAP: Record<string, string> = {
  'amazon.sa': 'ar_SA',
  'amazon.eg': 'ar_EG',
  'amazon.ae': 'ar_AE',
};

function buildRainforestParams(
  pathSegments: string,
  queryParams: Record<string, string | string[] | undefined>
): Record<string, string> {
  const params: Record<string, string> = {
    api_key: RAINFOREST_API_KEY || '',
  };

  const lang = String(queryParams.language || '');
  const domain = String(queryParams.amazon_domain || 'amazon.sa');

  if (lang === 'ar') {
    params.language = DOMAIN_LANGUAGE_MAP[domain] || 'ar_SA';
  }

  const segments = pathSegments.split('/');

  if (segments[0] === 'products' && segments[1] === 'search') {
    params.type = 'search';
    params.search_term = String(queryParams.q || '');
    params.amazon_domain = domain;
    if (queryParams.num) {
      params.number_of_results = String(queryParams.num);
    }
    return params;
  }

  if (segments[0] === 'products' && segments[1] === 'bestsellers') {
    params.type = 'bestsellers';
    const category = queryParams.category ? String(queryParams.category) : 'aps';
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

  if (segments[0] === 'products' && segments[1]) {
    params.type = 'product';
    params.asin = segments[1];
    params.amazon_domain = domain;
    return params;
  }

  return params;
}

function httpsGet(url: string, ip: string): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timeout after ${RAINFOREST_TIMEOUT / 1000}s`));
    }, RAINFOREST_TIMEOUT);

    const parsedUrl = new URL(url);
    const pathWithQuery = parsedUrl.pathname + parsedUrl.search;

    const req = https.request(
      {
        hostname: ip,
        port: 443,
        path: pathWithQuery,
        method: 'GET',
        headers: {
          'Host': RAINFOREST_HOST,
          'Content-Type': 'application/json',
        },
        timeout: RAINFOREST_TIMEOUT,
        servername: RAINFOREST_HOST,
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => (body += chunk));
        response.on('end', () => {
          clearTimeout(timer);
          try {
            const data = JSON.parse(body);
            resolve({ status: response.statusCode || 500, data });
          } catch {
            reject(new Error('Invalid JSON response from Rainforest API'));
          }
        });
      }
    );

    req.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    req.on('timeout', () => {
      clearTimeout(timer);
      req.destroy();
      reject(new Error(`Connection timeout after ${RAINFOREST_TIMEOUT / 1000}s`));
    });

    req.end();
  });
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
    const ip = await resolveIp();

    const { status, data } = await httpsGet(url.toString(), ip);

    if (status >= 400) {
      console.error(`[Amazon Proxy] Rainforest API error: ${status}`, data);
      return res.status(status).json({
        error: 'Rainforest API error',
        message: data.error || data.message || `HTTP ${status}`,
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
