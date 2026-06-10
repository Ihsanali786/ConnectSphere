export default {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/utils.test.js'],
      testEnvironment: 'node',
      transform: {},
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/auth.test.js'],
      setupFilesAfterEnv: ['./tests/setup.js'],
      testEnvironment: 'node',
      testTimeout: 120000,
      transform: {},
    },
  ],
};
