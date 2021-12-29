'use strict';

const config = require('./src/config');

module.exports = {
  configs: {
    config,
  },
  rules: {
    'imports/statement-order': require('./src/rules/imports/statement-order'),
  },
};
