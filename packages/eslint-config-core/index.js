import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

const sharedRules = {
  'no-console': 'off',
  'no-underscore-dangle': 'off',
  'no-param-reassign': ['error', { props: false }],
  'no-plusplus': 'off',
  'import/prefer-default-export': 'off',
};

const tsRules = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-require-imports': 'warn',
  '@typescript-eslint/ban-ts-comment': 'warn',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/jest.config.js',
      '**/jest.mock.js',
      '**/webpack.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      ...sharedRules,
      ...tsRules,
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-len': 'off',
    },
  },
  prettierConfig,
];
