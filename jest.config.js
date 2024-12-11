/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const jestConfig = {
  preset: 'ts-jest',
  verbose: false,
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/types/'
  ],
  setupFiles: ['<rootDir>/tests/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  resetMocks: true, // reset mocks before each test
  restoreMocks: true, // clears spies after each test
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tests/tsconfig.json'
      }
    ]
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'tests.ts',
    '.types.ts',
    'src/lib/parsers/yardi',
    'src/lib/utils/logger.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  coverageReporters: ['text'],
  moduleNameMapper: {
    '\\$lib/(.*)': '<rootDir>/src/lib/$1',
    '\\$fixtures(.*)': '<rootDir>/tests/fixtures$1',
    '\\$functions/(.*)': '<rootDir>/src/functions/$1'
  }
};

export default jestConfig;
