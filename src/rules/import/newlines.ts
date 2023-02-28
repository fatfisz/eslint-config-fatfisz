import { TSESTree } from '@typescript-eslint/types';
import { AST, Rule, SourceCode } from 'eslint';

import { assertNever } from 'assertNever';
import { Node } from 'estree';
import { getImportSource, getImportType, ImportType } from './util/importType';
import { getPackagesFromSettings } from './util/settings';
import { getLocFromRange, getWholeRange } from './util/sourceCode';

const messages = {
  insertNewline: 'Add the missing newline between imports',
  removeNewline: 'Remove the extra newline between imports',
};


export const rule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    messages,
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
  let previousStatement: TSESTree.ProgramStatement | undefined;
  let previousGroup: number | undefined;
  for (const statement of program.body) {
    const importType = getImportType(sourceCode, statement);
    const importSource = getImportSource(statement);
    const group = getGroup(packages, importType, importSource);
    if (previousStatement) {
      const previousRange = getWholeRange(sourceCode, previousStatement).withoutWhitespace;
      const range = getWholeRange(sourceCode, statement).withoutWhitespace;
      const emptyLines = getEmptyLinesBetweenTokens(sourceCode, previousRange, range);
      if (group === previousGroup && emptyLines >= 1) {
        context.report({
          loc: getLocFromRange(sourceCode, [range[0], range[0]]),
          messageId: 'removeNewline',
          fix: (fixer) => fixer.removeRange(range, '\n'),
        });
      } else if (group !== previousGroup && emptyLines < 1) {
        context.report({
          loc: getLocFromRange(sourceCode, [range[0], range[0]]),
          messageId: 'insertNewline',
          fix: (fixer) => fixer.insertTextBeforeRange(range, '\n'),
        });
      }
    }
    previousStatement = statement;
    previousGroup = group;
  }
}


function getGroup(
  packages: Set<string>,
  importType: ImportType,
  importSource: string | undefined,
): number {
  if (importType === 'statement') {
    return 0;
  }
  if (importType === 'moduleImport') {
    return 1;
  }
  if (importType === 'typeImport' || importType === 'valueImport') {
    return importSource && packages.has(importSource) ? 2 : 2.5;
  }
  if (importType === 'typeReexport' || importType === 'valueReexport') {
    return importSource && packages.has(importSource) ? 3 : 3.5;
  }
  if (importType === 'typeExport' || importType === 'valueExport') {
    return 4;
  }
  assertNever(importType);
}


function getEmptyLinesBetweenTokens(
  sourceCode: SourceCode,
  leftRange: AST.Range,
  rightRange: AST.Range,
) {
  const lastToken = sourceCode.getLastToken({ range: leftRange } as Node, {
    includeComments: true,
  })!;
  const firstToken = sourceCode.getFirstToken({ range: rightRange } as Node, {
    includeComments: true,
  })!;
  const lastLine = lastToken.loc!.end.line;
  const firstLine = firstToken.loc!.start.line;
  if (firstLine - lastLine <= 1) {
    return 0;
  }
  const tokensBetween = sourceCode.getTokensBetween(lastToken, firstToken, {
    includeComments: true,
  });
  let sum = 0;
  let line = lastLine;
  for (const token of tokensBetween) {
    sum += Math.max(0, token.loc!.start.line - line - 1);
    line = token.loc!.end.line;
  }
  sum += Math.max(0, firstLine - line - 1);
  return sum;
}
