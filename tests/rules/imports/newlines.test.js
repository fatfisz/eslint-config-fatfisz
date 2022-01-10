'use strict';

const { RuleTester } = require('eslint');

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
}).run('fatfisz/import/newlines', require('../../utils').getLib().rules['import/newlines'], {
  valid: [
    {
      // only: true,
      code: "import 'a'; /* something */ import 'b';",
    },
    {
      // only: true,
      code: `import 'a';
import 'b';
`,
    },
    {
      // only: true,
      name: 'allows comments between imports',
      code: `import 'a';
/**
 * an important thing to know is...
 */
import 'b';
`,
    },
    {
      only: true,
      name: 'allows comments between imports 2',
      code: `import 'a';
1; /**
 * an important thing to know is...
 */ import 'b';
`,
    },
  ],
  invalid: [],
});
