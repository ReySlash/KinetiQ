/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: 'pnpm',
  testRunner: 'jest',
  checkers: ['typescript'],
  plugins: [
    '@stryker-mutator/jest-runner',
    '@stryker-mutator/typescript-checker',
  ],
  mutate: [
    'src/modules/analytics/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test-doubles.ts',
  ],
  jest: {
    projectType: 'custom',
    configFile: 'package.json',
    enableFindRelatedTests: true,
  },
  coverageAnalysis: 'perTest',
  tsconfigFile: 'tsconfig.build.json',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  incremental: true,
  incrementalFile: 'reports/stryker-analytics-incremental.json',
  jsonReporter: {
    fileName: 'reports/mutation/analytics-mutation.json',
  },
  htmlReporter: {
    fileName: 'reports/mutation/analytics-mutation.html',
  },
};

export default config;
