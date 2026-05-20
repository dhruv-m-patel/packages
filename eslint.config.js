import core from '@dhruv-m-patel/eslint-config-core';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '.yarn/**',
      '.github/**',
      'boilerplates/**',
      '**/*.css',
      '**/*.svg',
      '**/public/**',
      '**/*.yaml',
      '**/*.yml',
      '**/jest.config.js',
      '**/jest.mock.js',
      '**/webpack.config.js',
    ],
  },
  ...core,
];
