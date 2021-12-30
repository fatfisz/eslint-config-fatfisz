import { Linter } from 'eslint';
import { Merge, SetRequired } from 'type-fest';

import { checkDeps } from './checkDeps';
import { isPackageInstalled } from './isPackageInstalled';
import { restrictedGlobals } from './restrictedGlobals';

checkDeps();

export const config: Merge<
  SetRequired<Linter.Config, 'overrides' | 'plugins' | 'rules' | 'settings'>,
  { extends: string[] }
> = {
  settings: {},

  extends: ['eslint:recommended', 'prettier'],

  plugins: ['import', 'prettier'],

  env: { es2020: true, 'shared-node-browser': true },

  parserOptions: {
    ecmaVersion: 2020,
  },

  reportUnusedDisableDirectives: true,

  rules: {
    curly: 'warn',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-prototype-builtins': 'off',
    'no-restricted-globals': ['warn', ...restrictedGlobals],
    'no-sparse-arrays': 'off',
    'no-unreachable': 'warn',
    'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'no-useless-rename': 'warn',
    'object-shorthand': 'warn',
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'directive' },
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'never', prev: 'directive', next: 'directive' },
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: 'function', next: '*' },
    ],
    quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    'sort-imports': [
      'warn',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    strict: ['warn', 'global'],

    'import/first': 'warn',
    'import/newline-after-import': 'warn',
    'import/no-default-export': 'warn',
    'import/no-duplicates': 'warn',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    'prettier/prettier': [
      'warn',
      {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },

  overrides: [
    {
      files: '.eslintrc.js',
      env: { node: true },
    },
    {
      files: '**/*.js',
      parserOptions: { sourceType: 'script' },
      rules: {},
    },
    {
      files: '**/*.json',
      rules: { quotes: 'off' },
    },
  ],
};

if (isPackageInstalled('react')) {
  config.settings.react = { version: 'detect' };

  config.extends.push(
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  );

  Object.assign(config.rules, {
    'react/jsx-curly-brace-presence': ['warn', 'never'],
    /**
     * The way this rule is implemented makes it overly restrictive, eg. elements in an array
     * passed to a component that wraps them in elements with their own keys will also get
     * a warning. Since React warns about it in the console, it's better to rely on it rather than
     * on a broken rule.
     */
    'react/jsx-key': 'off',
    // Overly restrictive for React.createElement, not possible to configure to turn it off in that case
    'react/no-children-prop': 'off',
    'react/prop-types': 'warn',
  });
}

if (isPackageInstalled('typescript')) {
  config.extends.push('plugin:@typescript-eslint/recommended');

  config.parser = '@typescript-eslint/parser';

  config.plugins.push('@typescript-eslint');

  Object.assign(config.rules, {
    '@typescript-eslint/array-type': ['warn', { default: 'array' }],
    '@typescript-eslint/ban-ts-comment': 'off',
    // {} might be too permissive, but I often need it in intersections with other types where it's ok
    '@typescript-eslint/ban-types': ['warn', { types: { '{}': false } }],
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }],
    '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: true }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-var-requires': 'off',
    'no-unused-vars': 'off',
  });

  Object.assign(config.overrides.find((override) => override.files === '**/*.js')?.rules, {
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
  });

  config.overrides.push({
    files: '**/*.d.ts',
    rules: { 'import/no-default-export': 'off' },
  });
}

if (isPackageInstalled('react') && isPackageInstalled('typescript')) {
  config.rules['react/prop-types'] = 'off';
}

if (isPackageInstalled('jest')) {
  const restrictedMessage = 'Do merge tests that are a work in progress.';

  config.overrides.push({
    files: '**/*.test.*',
    env: { jest: true },
    rules: {
      'no-restricted-globals': [
        'warn',
        ...restrictedGlobals,
        { name: 'fdescribe', message: restrictedMessage },
        { name: 'fit', message: restrictedMessage },
        { name: 'xdescribe', message: restrictedMessage },
        { name: 'xit', message: restrictedMessage },
        { name: 'xtest', message: restrictedMessage },
      ],
      'no-restricted-properties': [
        'warn',
        { object: 'describe', property: 'only', message: restrictedMessage },
        { object: 'describe', property: 'skip', message: restrictedMessage },
        { object: 'describe', property: 'todo', message: restrictedMessage },
        { object: 'it', property: 'only', message: restrictedMessage },
        { object: 'it', property: 'skip', message: restrictedMessage },
        { object: 'it', property: 'todo', message: restrictedMessage },
        { object: 'test', property: 'only', message: restrictedMessage },
        { object: 'test', property: 'skip', message: restrictedMessage },
        { object: 'test', property: 'todo', message: restrictedMessage },
      ],
    },
  });
}

if (isPackageInstalled('next')) {
  config.overrides.push(
    {
      files: 'pages/**',
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['next.config.js', 'pages/api/**'],
      env: { node: true },
    },
  );
}

if (isPackageInstalled('rollup')) {
  config.overrides.push({
    files: 'rollup.config.js',
    parserOptions: { sourceType: 'module' },
    rules: { 'import/no-default-export': 'off' },
  });
}

if (isPackageInstalled('@storybook/core')) {
  config.overrides.push(
    {
      files: '**/*.stories.tsx',
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: '.storybook/**',
      excludedFiles: '.storybook/main.js',
      parserOptions: { sourceType: 'module' },
    },
    {
      files: '.storybook/main.js',
      env: { node: true },
    },
  );
}
