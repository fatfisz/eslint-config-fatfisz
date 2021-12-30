'use strict';

const { config } = require('./lib/config');

module.exports = {
  configs: {
    config,
  },
  rules: {
    'imports/statement-order': require('./lib/rules/imports/statementOrder').rule,
  },
};
