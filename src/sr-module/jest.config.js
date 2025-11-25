/**
 * Jest configuration for SR module tests
 * Run from project root with: jest --config src/sr-module/jest.config.js
 */

const path = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.join(__dirname, '../..'), // Project root
  testMatch: ['<rootDir>/src/sr-module/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  collectCoverageFrom: [
    'src/sr-module/**/*.ts',
    '!src/sr-module/**/*.d.ts',
    '!src/sr-module/node_modules/**',
    '!src/sr-module/tests/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.\\./)+db/(.*)$': '<rootDir>/src/sr-module/db/$2',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  resolver: undefined,
  setupFilesAfterEnv: ['<rootDir>/src/sr-module/tests/setup.ts'],
};

