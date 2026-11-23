import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'dist',
          include: ['tests/dist/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
