import type { NextApiRequest, NextApiResponse } from 'next';

const AMAZON_BACKEND_URL = process.env.AMAZON_API_URL || 'http://localhost:5000/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const pathSegments = Array.isArray(path) ? path.join('/') : path || '';

  const targetUrl = `${AMAZON_BACKEND_URL}/${pathSegments}`;

  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      queryParams.append(key, String(value));
    }
  });

  const urlWithParams = queryParams.toString()
    ? `${targetUrl}?${queryParams.toString()}`
    : targetUrl;

  try {
    const response = await fetch(urlWithParams, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Amazon API proxy error:', error.message);
    res.status(502).json({
      error: 'Amazon API proxy error',
      message: error.message,
    });
  }
}
