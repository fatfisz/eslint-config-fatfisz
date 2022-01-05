'use strict';

const { RuleTester } = require('eslint');

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
}).run('fatfisz/import/sort', require('../../utils').getLib().rules['import/sort'], {
  valid: [
    {
      name: 'does not sort if there are imports of a different type between',
      code: `import 'a';
import 'b';
import 'c';

import type { C } from 'a';
import type { B } from 'b';
import type { A } from 'c';

import { c } from 'a';
import { b } from 'b';
import { a } from 'c';

export type { C } from 'a';
export type { B } from 'b';
export type { A } from 'c';

export { c } from 'a';
export { b } from 'b';
export { a } from 'c';
    `,
    },
    {
      name: 'does not sort if there are imports of a different type between',
      code: `import { a } from 'c';
import 'b';
import { c } from 'a';
`,
    },
  ],
  invalid: [
    {
      name: 'sorts module imports by path',
      code: `import 'c';
import 'b';
import 'a';
`,
      errors: [{ messageId: 'wrongOrder', line: 3, column: 1, endLine: 4, endColumn: 1 }],
      output: `import 'a';
import 'c';
import 'b';
`,
    },
    {
      name: 'sorts type imports by path',
      code: `import type { a } from 'c';
import type { b } from 'b';
import type { c } from 'a';
`,
      errors: [{ messageId: 'wrongOrder', line: 3, column: 1, endLine: 4, endColumn: 1 }],
      output: `import type { c } from 'a';
import type { a } from 'c';
import type { b } from 'b';
`,
    },
    {
      name: 'sorts value imports by path',
      code: `import { a } from 'c';
import { b } from 'b';
import { c } from 'a';
`,
      errors: [{ messageId: 'wrongOrder', line: 3, column: 1, endLine: 4, endColumn: 1 }],
      output: `import { c } from 'a';
import { a } from 'c';
import { b } from 'b';
`,
    },
    {
      name: 'sorts type re-exports by path',
      code: `export type { A } from 'c';
export type { B } from 'b';
export type { C } from 'a';
`,
      errors: [{ messageId: 'wrongOrder', line: 3, column: 1, endLine: 4, endColumn: 1 }],
      output: `export type { C } from 'a';
export type { A } from 'c';
export type { B } from 'b';
`,
    },
    {
      name: 'sorts value re-exports by path',
      code: `export { a } from 'c';
export { b } from 'b';
export { c } from 'a';
`,
      errors: [{ messageId: 'wrongOrder', line: 3, column: 1, endLine: 4, endColumn: 1 }],
      output: `export { c } from 'a';
export { a } from 'c';
export { b } from 'b';
`,
    },
    {
      name: 'sorts by path inside groups separately',
      code: `import { a } from 'f';
import { b } from 'e';
import 'd';
import 'c';
import { e } from 'b';
import { f } from 'a';
`,
      errors: [
        { messageId: 'wrongOrder', line: 2, column: 1, endLine: 3, endColumn: 1 },
        { messageId: 'wrongOrder', line: 4, column: 1, endLine: 5, endColumn: 1 },
        { messageId: 'wrongOrder', line: 6, column: 1, endLine: 7, endColumn: 1 },
      ],
      output: `import { b } from 'e';
import { a } from 'f';
import 'd';
import 'c';
import { f } from 'a';
import { e } from 'b';
`,
    },
  ],
});
