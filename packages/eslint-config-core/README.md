# @dhruv-m-patel/eslint-config-base

Basic code standards for javascript and typescript projects

![CI Status](https://github.com/dhruv-m-patel/packages/workflows/build/badge.svg)

### Usage

1. Install the package
   ```bash
   npm i -D @dhruv-m-patel/eslint-config-base
   # OR
   yarn add @dhruv-m-patel/eslint-config-base --dev
   ```

2. Edit your `.eslintrc` or ESLint config file as follows:
   ```json
   {
     "extends": ["@dhruv-m-patel/eslint-config-base", "and-other-eslint-configs"]
   }
   ```

Note: Make sure to have `eslint` package installed as its a peerDependency for this package.
