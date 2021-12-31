'use strict';

const { config } = require('./lib/config');

module.exports = {
  configs: {
    config,
  },
  rules: {
    'import/first': require('./lib/rules/import/first').rule,
  },
};
