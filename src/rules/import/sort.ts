import { TSESTree } from '@typescript-eslint/types';
import { Rule } from 'eslint';
import { isAbsolute, normalize, sep } from 'path';
import { getImportSource, getImportType, ImportType } from './util/importType';
import { getPackagesFromSettings } from './util/settings';
import { getLocFromRange, getTextFromRange, getWholeRange } from './util/sourceCode';

export const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    messages: {
      wrongOrder: 'Imports and exports should be sorted by path',
    },
  },
  create: (context) => ({
    Program: (node) => {
      checkProgram(context, node as TSESTree.Program);
    },
  }),
};

function checkProgram(context: Rule.RuleContext, program: TSESTree.Program) {
  const packages = getPackagesFromSettings(context);
  const sourceCode = context.getSourceCode();
  const statementsWithPaths: [string, TSESTree.ProgramStatement][] = [];
  let currentImportType: ImportType | undefined;
  for (const statement of program.body) {
    const importType = getImportType(sourceCode, statement);
    const importSource = getImportSource(statement);
    if (importType !== currentImportType) {
      checkOrder(context, packages, statementsWithPaths);
      currentImportType = importType;
      statementsWithPaths.length = 0;
    }
    if (importSource) {
      statementsWithPaths.push([importSource, statement]);
    }
  }
  checkOrder(context, packages, statementsWithPaths);
}

function checkOrder(
  context: Rule.RuleContext,
  packages: Set<string>,
  statementsWithPaths: [string, TSESTree.ProgramStatement][],
) {
  const sourceCode = context.getSourceCode();
  const sortedStatementsWithPaths = [...statementsWithPaths].sort(([pathA], [pathB]) =>
    comparePaths(packages, pathA, pathB),
  );
  for (let index = 0; index < statementsWithPaths.length; ++index) {
    const actual = statementsWithPaths[index][1];
    const expected = sortedStatementsWithPaths[index][1];
    if (expected !== actual) {
      const range = getWholeRange(sourceCode, expected).withWhitespace;
      context.report({
        loc: getLocFromRange(sourceCode, range),
        messageId: 'wrongOrder',
        fix: (fixer) => [
          fixer.removeRange(range),
          fixer.insertTextBeforeRange(
            getWholeRange(sourceCode, actual).withWhitespace,
            getTextFromRange(sourceCode, range),
          ),
        ],
      });
      return;
    }
  }
}

const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});

function comparePaths(packages: Set<string>, pathA: string, pathB: string) {
  return (
    getPackageIndex(packages, pathA) - getPackageIndex(packages, pathB) ||
    getNestingIndex(pathA) - getNestingIndex(pathB) ||
    collator.compare(pathA, pathB)
  );
}

function getPackageIndex(packages: Set<string>, path: string): number {
  const scoped = path.startsWith('@');
  if (packages.has(path)) {
    return scoped ? 0 : 1;
  }
  const absolute = isAbsolute(path);
  const local = path.startsWith('.');
  if (!absolute && !local) {
    return scoped ? 2 : 3;
  }
  return absolute ? 4 : 5;
}

function getNestingIndex(path: string): number {
  if (!path.startsWith('.')) {
    return 0;
  }
  const normalized = normalize(path);
  let upSegments = 0;
  while (normalized.startsWith(`..${sep}`, upSegments * 3)) {
    upSegments += 1;
  }
  return -upSegments - 1;
}
