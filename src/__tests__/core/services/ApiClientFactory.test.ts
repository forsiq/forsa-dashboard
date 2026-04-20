import Cookies from 'js-cookie';

// We need to intercept the axios.create return value globally
// The real ApiClientFactory calls axios.create() which returns an instance
// We mock it to capture the interceptors
let capturedInterceptors: {
  request: Array<(config: any) => any>;
  response: Array<{ onFulfilled: any; onRejected: any }>;
} = { request: [], response: [] };

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn((fn: any) => {
        capturedInterceptors.request.push(fn);
      }),
    },
    response: {
      use: jest.fn((onFulfilled: any, onRejected: any) => {
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

jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => 'test-token'),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('API Client Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedInterceptors = { request: [], response: [] };
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
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
    const { createApiClient } = require('@core/services/ApiClientFactory');
    createApiClient({ serviceName: 'test', endpoint: '/test' });

    expect(capturedInterceptors.request.length).toBeGreaterThan(0);

    const requestInterceptor = capturedInterceptors.request[0];
    const config: any = { headers: {} };
    requestInterceptor(config);

    expect(config.headers.Authorization).toBe('Bearer test-access-token');
    expect(config.headers['X-Project-ID']).toBe('11');
  });

  it('should fall back to localStorage when cookie is empty', () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'access_token') return 'localStorage-token';
      if (key === 'zv_project') return JSON.stringify({ id: '22' });
      return null;
    });

    const { createApiClient } = require('@core/services/ApiClientFactory');
    createApiClient({ serviceName: 'test', endpoint: '/test' });

    const requestInterceptor = capturedInterceptors.request[capturedInterceptors.request.length - 1];
    const config: any = { headers: {} };
    requestInterceptor(config);

    expect(config.headers.Authorization).toBe('Bearer localStorage-token');
    expect(config.headers['X-Project-ID']).toBe('22');
  });

  it('should not attach token when none is found', () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    const { createApiClient } = require('@core/services/ApiClientFactory');
    createApiClient({ serviceName: 'test', endpoint: '/test' });

    const requestInterceptor = capturedInterceptors.request[capturedInterceptors.request.length - 1];
    const config: any = { method: 'post', url: '/test/', headers: {} };
    requestInterceptor(config);

    expect(config.headers.Authorization).toBeUndefined();
    // Project ID should still be the default '11'
    expect(config.headers['X-Project-ID']).toBe('11');
  });
});
