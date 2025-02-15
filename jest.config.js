/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.tests.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/__tests__/setup.tests.ts',
    '<rootDir>/__tests__/__mocks__/',
    '<rootDir>/__tests__/mock-data/',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  coveragePathIgnorePatterns: [
    '<rootDir>/__tests__/',
    '<rootDir>/src/index.tsx',
    '<rootDir>/src/reportWebVitals.ts',
    '<rootDir>/src/themes/index.ts',
  ],
  transform: {
    '^.+\\.(tsx|ts|jsx|js)?$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!react-movable)'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__tests__/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|mp3|png)$':
      '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
};

module.exports = { ...config };
