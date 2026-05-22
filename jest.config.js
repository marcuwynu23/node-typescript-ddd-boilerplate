/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
  moduleNameMapper: {
    '^@scalar/express-api-reference$': '<rootDir>/src/tests/__mocks__/scalar.ts',
  },
};
