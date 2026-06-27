import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts'], // CLI is integration-tested via subprocess, not unit-testable for coverage
      reporter: ['text', 'text-summary', 'lcov'],
    },
  },
});
