'use strict';

module.exports = {
  globalSetup: require.resolve('./setupGlobal.js'),
  haste: {
    hasteImplModulePath: require.resolve('./noHaste.js'),
  },
  modulePathIgnorePatterns: [
    '<rootDir>/scripts/rollup/shims/',
    '<rootDir>/scripts/bench/',
  ],
  transform: {
    '.*': require.resolve('./preprocessor.js'),
  },
  setupFiles: [require.resolve('./setupEnvironment.js')],
  setupFilesAfterEnv: [require.resolve('./setupTests.js')],
  // Only include files directly in __tests__, not in nested folders.
  testRegex: '/__tests__/[^/]*(\\.js|\\.coffee|[^d]\\.ts)$',
  moduleFileExtensions: ['js', 'json', 'node', 'coffee', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages', '<rootDir>/scripts'],
  collectCoverageFrom: ['packages/**/*.js'],
  // TODO: Use the default `modern` implementation (includes `jest.useFakeTimers()`)
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true,
  },
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  snapshotSerializers: [require.resolve('jest-snapshot-serializer-raw')],

  testSequencer: require.resolve('./jestSequencer'),

  testEnvironment: 'jsdom',
  // TODO: Use the default runner jest-circus
  testRunner: 'jest-jasmine2',
};
