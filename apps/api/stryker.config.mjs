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
    'src/modules/adopted-training-programs/domain/**/*.ts',
    'src/modules/adopted-training-programs/application/**/*.ts',
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
  incremental: true,
  incrementalFile: 'reports/stryker-incremental.json',
};

export default config;
