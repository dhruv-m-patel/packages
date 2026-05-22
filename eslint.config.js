import core from '@dhruv-m-patel/eslint-config-core';
import web from '@dhruv-m-patel/eslint-config-web';

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
  // React packages need eslint-config-web (jsx-a11y, react, react-hooks plugins)
  // so the inline disable directives in their source files resolve correctly.
  ...web.map((cfg) => ({
    ...cfg,
    files: [
      'packages/react-components/**/*.{ts,tsx}',
      'packages/react-hooks/**/*.{ts,tsx}',
    ],
  })),
];
