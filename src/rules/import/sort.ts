import { getImportSource, getImportType, ImportType } from './importType';
import { getLocFromRange, getRangeWithCommentsAndWhitespace, getTextFromRange } from './sourceCode';
import { TSESTree } from '@typescript-eslint/types';
import { Rule } from 'eslint';

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
  const sourceCode = context.getSourceCode();
  const statementsWithPaths: [string, TSESTree.ProgramStatement][] = [];
  let currentImportType: ImportType | undefined;
  for (const statement of program.body) {
    const importType = getImportType(sourceCode, statement);
    const importSource = getImportSource(statement);
    if (importType !== currentImportType) {
      checkOrder(context, statementsWithPaths);
      currentImportType = importType;
      statementsWithPaths.length = 0;
    }
    if (importSource) {
      const path = importSource.value;
      statementsWithPaths.push([path, statement]);
    }
  }
  checkOrder(context, statementsWithPaths);
}

const collator = new Intl.Collator('en', { numeric: true });

function checkOrder(
  context: Rule.RuleContext,
  statementsWithPaths: [string, TSESTree.ProgramStatement][],
) {
  const sourceCode = context.getSourceCode();
  const sortedStatementsWithPaths = [...statementsWithPaths].sort(([pathA], [pathB]) =>
    collator.compare(pathA, pathB),
  );
  for (let index = 0; index < statementsWithPaths.length; ++index) {
    const actual = statementsWithPaths[index][1];
    const expected = sortedStatementsWithPaths[index][1];
    if (expected !== actual) {
      const range = getRangeWithCommentsAndWhitespace(sourceCode, expected);
      context.report({
        loc: getLocFromRange(sourceCode, range),
        messageId: 'wrongOrder',
        fix: (fixer) => [
          fixer.removeRange(range),
          fixer.insertTextBeforeRange(
            getRangeWithCommentsAndWhitespace(sourceCode, actual),
            getTextFromRange(sourceCode, range),
          ),
        ],
      });
      return;
    }
  }
}
