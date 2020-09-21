'use strict';

module.exports = {
  root: true,
  extends: ['./index.js'],

  overrides: [
    {
      files: ['**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
