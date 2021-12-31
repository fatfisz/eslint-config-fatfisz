'use strict';

module.exports = {
  root: true,

  ignorePatterns: ['/lib'],

  extends: ['plugin:self/config'],

  overrides: [
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
