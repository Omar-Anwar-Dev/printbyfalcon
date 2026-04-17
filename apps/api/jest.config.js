/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: { target: 'ES2020', module: 'commonjs', esModuleInterop: true, experimentalDecorators: true, emitDecoratorMetadata: true, strict: false } }],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  rootDir: './src',
  testTimeout: 10000,
};
