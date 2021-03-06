'use strict';

const { isPackageInstalled } = require('./isPackageInstalled');

const config = {
  settings: {},

  extends: ['eslint:recommended', 'prettier'],

  plugins: ['import', 'prettier'],

  rules: {
    curly: 'warn',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'no-prototype-builtins': 'off',
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
      env: {
        node: true,
      },
    },
    {
      files: '**/*.js',
      parserOptions: {
        sourceType: 'script',
      },
      rules: {},
    },
  ],
};

if (isPackageInstalled('eslint-plugin-react')) {
  config.settings.react = {
    version: 'detect',
  };

  config.extends.push('plugin:react/recommended', 'plugin:react-hooks/recommended');

  Object.assign(config.rules, {
    'react/prop-types': 'warn',
    // If you are not auto-injecting React, then fix that ;)
    'react/react-in-jsx-scope': 'off',
  });
}

if (isPackageInstalled('@typescript-eslint/eslint-plugin')) {
  config.extends.push('plugin:@typescript-eslint/recommended');

  config.parser = '@typescript-eslint/parser';

  config.plugins.push('@typescript-eslint');

  Object.assign(config.rules, {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: true }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'no-unused-vars': 'off',
  });

  if (config.rules.hasOwnProperty('react/prop-types')) {
    config.rules['react/prop-types'] = 'off';
  }

  Object.assign(config.overrides.find((override) => override.files === '**/*.js').rules, {
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
  });

  config.overrides.push({
    files: '**/*.d.ts',
    rules: {
      'import/no-default-export': 'off',
    },
  });
}

if (isPackageInstalled('next')) {
  config.overrides.push(
    {
      files: 'pages/**',
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['next.config.js', 'pages/api/**'],
      env: {
        node: true,
      },
    },
  );
}

if (isPackageInstalled('rollup')) {
  config.overrides.push({
    files: 'rollup.config.js',
    parserOptions: {
      sourceType: 'module',
    },
    rules: {
      'import/no-default-export': 'off',
    },
  });
}

module.exports = config;
