export default {
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  // preset: 'ts-jest/presets/default',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|mts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
