'use strict';

module.exports = {
  root: true,

  extends: ['./src/config.js'],

  overrides: [
    {
      files: ['**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
