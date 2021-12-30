'use strict';

const { RuleTester } = require('eslint');

const importModule = "import 'a';";

const importAllType = "import type * as AllImports from 'a';";
const importDefaultType = "import type DefaultImport from 'a';";
const importNamedType = "import type { NamedImport } from 'a';";

const importAll = "import * as allImports from 'a';";
const importDefault = "import defaultImport from 'a';";
const importNamed = "import { namedImport } from 'a';";

const reexportAllType = "export type * as ReexportedAll from 'a';";
const reexportNamedType = "export type { ReexportedNamed } from 'a';";

const reexportAll = "export * from 'a';";
const reexportNamed = "export { reexportedNamed } from 'a';";

const exportTypes = 'export type { Named };';

const exportNamed = 'export { named };';

const exportConst = 'export const constExport = 42;';
const exportDefault = 'export default 42;';
const exportDestructured = 'export const { destructuredExport } = 42;';
const exportFunction = 'export function exportedFunction() {}';
const exportType = 'export type NamedExport = 42;';
const expression = '42;';

const itemToName = {
  [importModule]: 'import a module',
  [importAllType]: 'import all types from a module',
  [importDefaultType]: 'import a default type',
  [importNamedType]: 'import a type',
  [importAll]: 'import all',
  [importDefault]: 'import a default value',
  [importNamed]: 'import a value',
  [reexportAllType]: 're-export all types',
  [reexportNamedType]: 're-export types',
  [reexportAll]: 're-export all values',
  [reexportNamed]: 're-export values',
  [exportTypes]: 'export types',
  [exportNamed]: 'export values',
  [exportConst]: 'export a constant',
  [exportDefault]: 'export a default value',
  [exportDestructured]: 'export from destructuring',
  [exportFunction]: 'export a function',
  [exportType]: 'export a type',
  [expression]: 'a statement',
};

new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
}).run('imports/statement-order', require('../../../lib/rules/imports/statementOrder').rule, {
  valid: [
    ...generateValidPairs(
      [importModule],
      [importAllType, importDefaultType, importNamedType],
      [importAll, importDefault, importNamed],
      [reexportAllType, reexportNamedType],
      [reexportAll, reexportNamed],
      [exportTypes],
      [exportNamed],
      [exportConst, exportDefault, exportDestructured, exportFunction, exportType, expression],
    ),
  ],
  invalid: [
    ...generateInvalidPairs(
      [exportConst, exportDefault, exportDestructured, exportFunction, exportType, expression],
      [
        importAll,
        importAllType,
        importDefault,
        importDefaultType,
        importModule,
        importNamed,
        importNamedType,
      ],
      'importAfterStatement',
    ),
    ...generateInvalidPairs(
      [exportNamed, exportTypes, reexportAll, reexportAllType, reexportNamed, reexportNamedType],
      [
        importAll,
        importAllType,
        importDefault,
        importDefaultType,
        importModule,
        importNamed,
        importNamedType,
      ],
      'importAfterExport',
    ),
    ...generateInvalidPairs(
      [importAll, importDefault, importNamed],
      [importAllType, importDefaultType, importNamedType],
      'importTypeAfterImport',
    ),
    ...generateInvalidPairs(
      [importAll, importAllType, importDefault, importDefaultType, importNamed, importNamedType],
      [importModule],
      'importModuleAfterImport',
    ),
    ...generateInvalidPairs(
      [exportConst, exportDefault, exportDestructured, exportFunction, exportType, expression],
      [exportNamed, exportTypes, reexportAll, reexportAllType, reexportNamed, reexportNamedType],
      'exportAfterStatement',
    ),
    ...generateInvalidPairs(
      [exportNamed, exportTypes],
      [reexportAll, reexportAllType, reexportNamed, reexportNamedType],
      'reexportAfterExport',
    ),
    ...generateInvalidPairs([exportNamed], [exportTypes], 'exportTypeAfterExport'),
    ...generateInvalidPairs(
      [reexportAll, reexportNamed],
      [reexportAllType, reexportNamedType],
      'reexportTypeAfterReexport',
    ),
    {
      name: 'skips multiple statements when fixing',
      code: "1;\n2;\n3;\nimport 'a';\n",
      errors: [{ messageId: 'importAfterStatement', line: 4, column: 1, endLine: 5, endColumn: 1 }],
      output: "import 'a';\n1;\n2;\n3;\n",
    },
    {
      name: 'skips multiple imports when fixing',
      code: "import { b } from 'b';\nimport { c } from 'c';\nimport { d } from 'd';\nimport 'a';\n",
      errors: [
        { messageId: 'importModuleAfterImport', line: 4, column: 1, endLine: 5, endColumn: 1 },
      ],
      output:
        "import 'a';\nimport { b } from 'b';\nimport { c } from 'c';\nimport { d } from 'd';\n",
    },
    {
      name: 'reports multiple errors',
      code: "1;\n2;\n3;\nexport * from 'a';\nimport 'a';\n",
      errors: [
        { messageId: 'exportAfterStatement', line: 4, column: 1, endLine: 5, endColumn: 1 },
        { messageId: 'importAfterExport', line: 5, column: 1, endLine: 6, endColumn: 1 },
      ],
      output: "export * from 'a';\n1;\n2;\n3;\nimport 'a';\n",
    },
    {
      name: 'moves all whitespace up to the next new line',
      code: "1;\nimport 'a';  \t\n2;\n",
      errors: [{ messageId: 'importAfterStatement', line: 2, column: 1, endLine: 3, endColumn: 1 }],
      output: "import 'a';  \t\n1;\n2;\n",
    },
    {
      name: 'moves comments from the same line',
      code: `1;
/**
 * this moves
 */ /* this too */ import {
  something, // This is very useful
} from 'a'; /* comment */ // inline comment
2;
`,
      errors: [{ messageId: 'importAfterStatement', line: 2, column: 1, endLine: 7, endColumn: 1 }],
      output: `/**
 * this moves
 */ /* this too */ import {
  something, // This is very useful
} from 'a'; /* comment */ // inline comment
1;
2;
`,
    },
    {
      name: 'moves comments on preceding lines',
      code: `1;
/* this stays */ // this also stays

// this moves
/* this moves too */
import 'a';
// this stays
2;
`,
      errors: [{ messageId: 'importAfterStatement', line: 4, column: 1, endLine: 7, endColumn: 1 }],
      output: `// this moves
/* this moves too */
import 'a';
1;
/* this stays */ // this also stays

// this stays
2;
`,
    },
    {
      name: 'leaves inline comments attached to the previous statement',
      code: `1; // leave me alone
import 'b';
`,
      errors: [{ messageId: 'importAfterStatement', line: 2, column: 1, endLine: 3, endColumn: 1 }],
      output: `import 'b';
1; // leave me alone
`,
    },
    {
      name: 'leaves multiline comments attached to the previous statement',
      code: `1; /**
 * leave me alone
 */ import 'b';
`,
      errors: [{ messageId: 'importAfterStatement', line: 3, column: 5, endLine: 4, endColumn: 1 }],
      output: `import 'b';
1; /**
 * leave me alone
 */ `,
    },
    {
      name: 'leaves multiline comments attached to the next statement',
      code: `1;
import 'a'; /**
 * leave me alone
 */ 2;
`,
      errors: [
        { messageId: 'importAfterStatement', line: 2, column: 1, endLine: 2, endColumn: 13 },
      ],
      output: `import 'a'; 1;
/**
 * leave me alone
 */ 2;
`,
    },
  ],
});

function generateValidPairs(...groups) {
  if (groups.length === 0) {
    return [];
  }
  const [first, ...rest] = groups;
  const flatRest = rest.flat();
  return [
    ...first.flatMap((firstItem, index) =>
      [...first.slice(0, index), ...first.slice(index), ...flatRest].map((secondItem) => ({
        name: getName(firstItem, secondItem),
        code: getCode(firstItem, secondItem),
      })),
    ),
    ...generateValidPairs(...rest),
  ];
}

function generateInvalidPairs(first, second, messageId, only = false) {
  return [
    ...first.flatMap((firstItem) =>
      second.map((secondItem) => ({
        only,
        name: getName(firstItem, secondItem),
        code: getCode(firstItem, secondItem),
        errors: [
          {
            messageId,
            line: 2,
            column: 1,
            endLine: 3,
            endColumn: 1,
          },
        ],
        output: getCode(secondItem, firstItem),
      })),
    ),
  ];
}

function getName(firstItem, secondItem) {
  const first = itemToName[firstItem];
  const second = itemToName[secondItem];
  if (!first) {
    throw new Error(`Missing ${firstItem}`);
  }
  if (!second) {
    throw new Error(`Missing ${secondItem}`);
  }
  return `${first}, then ${second}`;
}

function getCode(...statements) {
  return `${statements.join('\n')}
type Named = 42;
const named = 42;
`;
}
