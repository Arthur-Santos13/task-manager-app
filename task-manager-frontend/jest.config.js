const { createCjsPreset } = require('jest-preset-angular/presets');

const presetConfig = createCjsPreset();

/** @type {import('jest').Config} */
module.exports = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/src/__mocks__/style-mock.ts',
  },
};
