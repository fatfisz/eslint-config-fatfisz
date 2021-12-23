'use strict';

module.exports = {
  root: true,

  extends: ['./config.js'],

  overrides: [
    {
      files: ['**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
