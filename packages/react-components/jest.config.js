const path = require('path');
const JestConfig = require('../../jest.config');

const { projects, ...baseConfig } = JestConfig;

module.exports = {
  ...baseConfig,
  displayName: 'components',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    NODE_ENV: 'test',
  },
  clearMocks: true,
  verbose: true,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['/node_modules/', path.join(__dirname, 'build')],
  testMatch: [
    path.join(__dirname, 'src/**/*.test.ts'),
    path.join(__dirname, 'src/**/*.test.tsx'),
  ],
  rootDir: './src',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    path.join(__dirname, 'src/setupTests.ts'),
  ],
};
