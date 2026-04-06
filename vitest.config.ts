import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/core/**/*.ts', 'src/hooks/**/*.ts', 'src/components/**/*.tsx'],
      exclude: [
        'examples/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/index.ts',
        'dist/**',
        // Type-only files (models have no runtime code)
        'src/models/**',
        // Exclude wizard-mode components (not primary API, to be tested in Phase 3)
        'src/components/form/DynamicFormStep.tsx',
        'src/components/form/FormStepper.tsx',
        'src/hooks/useFormStep.ts',
        // Exclude array field (Phase 3 feature)
        'src/components/fields/ArrayField.tsx',
        'src/hooks/useFieldArray.ts',
        // Exclude the errors module (optional custom error classes)
        'src/core/errors.ts',
        // Exclude optional layout components
        'src/components/layout/FieldGroup.tsx',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
