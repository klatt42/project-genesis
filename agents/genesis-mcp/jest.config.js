export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tools'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  collectCoverageFrom: [
    'tools/**/*.ts',
    '!tools/**/*.test.ts',
    '!tools/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 20,
      lines: 40,
      statements: 38
    }
  }
};
