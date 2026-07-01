/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    // Local src/core overrides (must come before core-ui fallback — mirrors tsconfig paths)
    '^@core/layout/(.*)$': '<rootDir>/src/core/layout/$1',
    '^@core/auth/(.*)$': '<rootDir>/src/core/auth/$1',
    '^@core/hooks/(.*)$': '<rootDir>/src/core/hooks/$1',
    '^@core/query/(.*)$': '<rootDir>/src/core/query/$1',
    '^@core/navigation/(.*)$': '<rootDir>/src/core/navigation/$1',
    '^@core/loading/(.*)$': '<rootDir>/src/core/loading/$1',
    '^@core/pages/(.*)$': '<rootDir>/src/core/pages/$1',
    '^@core/validation/(.*)$': '<rootDir>/src/core/validation/$1',
    '^@core/utils/(.*)$': '<rootDir>/src/core/utils/$1',
    '^@core/contexts/TimerContext$': '<rootDir>/src/core/contexts/TimerContext',
    '^@core/lib/utils/(.*)$': '<rootDir>/src/core/lib/utils/$1',
    '^@core/services/serviceListFetch$': '<rootDir>/src/core/services/serviceListFetch',
    // Local @core/components overrides only — missing paths fall through to core-ui via ^@core/(.*)$
    '^@core/components$': '<rootDir>/src/core/components',
    '^@core/components/IqdPriceInput$': '<rootDir>/src/core/components/IqdPriceInput',
    '^@core/components/IqdSymbol$': '<rootDir>/src/core/components/IqdSymbol',
    '^@core/components/RoleGuard$': '<rootDir>/src/core/components/RoleGuard',
    '^@core/components/ProjectGuard$': '<rootDir>/src/core/components/ProjectGuard',
    '^@core/components/PageTransition$': '<rootDir>/src/core/components/PageTransition',
    '^@core/components/Mobile/(.*)$': '<rootDir>/src/core/components/Mobile/$1',
    '^@core/(.*)$': '<rootDir>/node_modules/@yousef2001/core-ui/dist/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|avif|ico|bmp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react-jsx',
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@yousef2001/core-ui)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
