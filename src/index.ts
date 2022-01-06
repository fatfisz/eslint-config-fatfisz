import { config } from './config';
import { rule as importFirstRule } from './rules/import/first';
import { rule as importNewlinesRule } from './rules/import/newlines';
import { rule as importSortRule } from './rules/import/sort';

module.exports = {
  configs: {
    config,
  },
  rules: {
    'import/first': importFirstRule,
    'import/newlines': importNewlinesRule,
    'import/sort': importSortRule,
  },
};
