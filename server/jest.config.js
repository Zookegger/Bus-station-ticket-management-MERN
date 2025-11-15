module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    '^chalk$': '<rootDir>/tests/__mocks__/chalk.js',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@constants$': '<rootDir>/src/constants/index',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@models$': '<rootDir>/src/models/index',
    '^@queues/(.*)$': '<rootDir>/src/utils/queues/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@my_types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@validators/(.*)$': '<rootDir>/src/middlewares/validators/$1',
    '^@workers/(.*)$': '<rootDir>/src/utils/workers/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(chalk)/)',
  ],
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
  // Detect open handles to help with cleanup issues
  detectOpenHandles: false,
  // Force exit after tests complete
  forceExit: true,
};
