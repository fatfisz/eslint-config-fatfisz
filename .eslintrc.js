'use strict';

const { config } = require('./lib/config');

const { overrides, ...configRest } = config;

module.exports = {
  ...configRest,

  root: true,

  ignorePatterns: ['/lib'],

  overrides: [
    ...overrides,
    {
      files: '**/*.js',
      env: { node: true },
    },
    {
      files: './src/rules/**/*.ts',
      // rules: { 'import/no-default-export': 'off' },
    },
  ],
};
