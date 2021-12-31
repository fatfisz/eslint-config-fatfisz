import { config } from './config';
import { rule as importFirstRule } from './rules/import/first';

module.exports = {
  configs: {
    config,
  },
  rules: {
    'import/first': importFirstRule,
  },
};
