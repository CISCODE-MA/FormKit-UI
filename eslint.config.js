import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.vitest/**'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // modern React: no need for React import in scope
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['src/utils/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'utils must not import react. Move code to hooks/components.',
            },
            {
              name: 'react-dom',
              message: 'utils must not import react-dom. Move code to hooks/components.',
            },
          ],
        },
      ],
    },
  },

  // must be last: turns off rules that conflict with prettier
  prettier,
];
