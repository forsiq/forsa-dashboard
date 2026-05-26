let capturedInterceptors: {
  request: Array<(config: Record<string, unknown>) => Record<string, unknown>>;
  response: Array<{ onFulfilled: unknown; onRejected: unknown }>;
} = { request: [], response: [] };

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn((fn: (config: Record<string, unknown>) => Record<string, unknown>) => {
        capturedInterceptors.request.push(fn);
      }),
    },
    response: {
      use: jest.fn((onFulfilled: unknown, onRejected: unknown) => {
        capturedInterceptors.response.push({ onFulfilled, onRejected });
      }),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
    post: jest.fn(),
  },
}));

const mockCookieGet = jest.fn();

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockCookieGet(...args),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

function loadFactory() {
  jest.resetModules();
  capturedInterceptors = { request: [], response: [] };
  return require('@core/services/ApiClientFactory') as typeof import('@core/services/ApiClientFactory');
}

function runRequestInterceptor(config: Record<string, unknown> = { headers: {} }) {
  const fn = capturedInterceptors.request[0];
  if (!fn) throw new Error('No request interceptor registered');
  return fn(config) as { headers: Record<string, string> };
}

describe('API Client Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieGet.mockImplementation((key: string) => {
      if (key === 'access') return 'test-access-token';
      if (key === 'refresh') return 'test-refresh-token';
      return undefined;
    });
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should attach Bearer token from cookie to request headers', () => {
    const { createApiClient } = loadFactory();
    createApiClient({ serviceName: 'test', endpoint: '/test', apiBaseUrl: 'http://test-a.local/api' });

    const config = runRequestInterceptor();

    expect(config.headers.Authorization).toBe('Bearer test-access-token');
    expect(config.headers['X-Project-ID']).toBe('11');
  });

  it('should read project ID from localStorage zv_project', () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'zv_project') return JSON.stringify({ id: '22' });
      return null;
    });

    const { createApiClient } = loadFactory();
    createApiClient({ serviceName: 'test', endpoint: '/test', apiBaseUrl: 'http://test-b.local/api' });

    const config = runRequestInterceptor();

    expect(config.headers.Authorization).toBe('Bearer test-access-token');
    expect(config.headers['X-Project-ID']).toBe('22');
  });

  it('should not attach token when none is found', () => {
    mockCookieGet.mockReturnValue(undefined);

    const { createApiClient } = loadFactory();
    createApiClient({ serviceName: 'test', endpoint: '/test', apiBaseUrl: 'http://test-c.local/api' });

    const config = runRequestInterceptor({ method: 'post', url: '/test/', headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
    expect(config.headers['X-Project-ID']).toBe('11');
  });
});
