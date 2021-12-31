import { TSESTree } from '@typescript-eslint/types';
import { AST, Rule, SourceCode } from 'eslint';
import { Node } from 'estree';

type Message = keyof typeof messages;
type SimpleType = typeof orderedSimpleTypes[number];

const messages = {
  exportAfterStatement: 'Exports should come before the code',
  exportTypeAfterExport: 'Types should be exported before values',
  importAfterExport: 'Imports should come before exports',
  importAfterStatement: 'Imports should come before the code',
  importModuleAfterImport: 'Modules with side effects should be mported first',
  importTypeAfterImport: 'Types should be imported before values',
  reexportAfterExport: 'Re-exports should come before exports',
  reexportTypeAfterReexport: 'Types should be re-exported before values',
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

const orderedSimpleTypes = [
  'importModule',
  'importType',
  'import',
  'reexportType',
  'reexport',
  'exportType',
  'export',
  'statement',
] as const;
const simpleTypeToOrder = Object.fromEntries(
  orderedSimpleTypes.map((type, index) => [type, index]),
) as Record<SimpleType, number>;

function checkProgram(context: Rule.RuleContext, program: TSESTree.Program) {
  const statementsWithTypes: [SimpleType, TSESTree.ProgramStatement][] = [];
  for (const statement of program.body) {
    const sourceCode = context.getSourceCode();
    const simpleType = getSimpleType(sourceCode, statement);
    const lastSimpleType = getLastSimpleType(statementsWithTypes);
    const errorMessageId = lastSimpleType && getErrorMessageId(lastSimpleType, simpleType);
    if (errorMessageId) {
      const lastProperlyOrderedStatement = getLastProperlyOrderedStatement(
        statementsWithTypes,
        simpleType,
      );
      const range = getRangeWithCommentsAndWhitespace(sourceCode, statement);
      context.report({
        loc: getLocFromRange(sourceCode, range),
        messageId: errorMessageId,
        fix: (fixer) => [
          fixer.removeRange(range),
          fixer.insertTextAfterRange(
            lastProperlyOrderedStatement.range,
            getTextFromRange(sourceCode, range),
          ),
        ],
      });
    }
    statementsWithTypes.push([simpleType, statement]);
  }
}

function getSimpleType(sourceCode: SourceCode, statement: TSESTree.ProgramStatement): SimpleType {
  return statement.type === 'ImportDeclaration'
    ? hasNoSpecifiers(sourceCode, statement)
      ? 'importModule'
      : statement.importKind === 'type'
      ? 'importType'
      : 'import'
    : (statement.type === 'ExportNamedDeclaration' && !statement.declaration) ||
      statement.type === 'ExportAllDeclaration'
    ? statement.source
      ? statement.exportKind === 'type'
        ? 'reexportType'
        : 'reexport'
      : statement.exportKind === 'type'
      ? 'exportType'
      : 'export'
    : 'statement';
}

function getErrorMessageId(
  lastSimpleType: SimpleType,
  simpleType: SimpleType,
): Message | undefined {
  if (lastSimpleType === 'statement' && isAnyImportType(simpleType)) {
    return 'importAfterStatement';
  }
  if (isAnyExportType(lastSimpleType) && isAnyImportType(simpleType)) {
    return 'importAfterExport';
  }
  if (lastSimpleType === 'import' && simpleType === 'importType') {
    return 'importTypeAfterImport';
  }
  if (
    isAnyImportType(lastSimpleType) &&
    lastSimpleType !== 'importModule' &&
    simpleType === 'importModule'
  ) {
    return 'importModuleAfterImport';
  }
  if (lastSimpleType === 'statement' && isAnyExportType(simpleType)) {
    return 'exportAfterStatement';
  }
  if (isExportType(lastSimpleType) && isReexportType(simpleType)) {
    return 'reexportAfterExport';
  }
  if (lastSimpleType === 'export' && simpleType === 'exportType') {
    return 'exportTypeAfterExport';
  }
  if (lastSimpleType === 'reexport' && simpleType === 'reexportType') {
    return 'reexportTypeAfterReexport';
  }
}

function getLastSimpleType(
  statementsWithTypes: [SimpleType, TSESTree.ProgramStatement][],
): SimpleType | undefined {
  return statementsWithTypes.length > 0
    ? statementsWithTypes[statementsWithTypes.length - 1][0]
    : undefined;
}

function getLastProperlyOrderedStatement(
  statementsWithTypes: [SimpleType, TSESTree.ProgramStatement][],
  simpleType: SimpleType,
): { range: AST.Range } {
  const maxOrder = simpleTypeToOrder[simpleType];
  for (let index = statementsWithTypes.length - 1; index >= 0; index -= 1) {
    const [simpleType, statement] = statementsWithTypes[index];
    const order = simpleTypeToOrder[simpleType];
    if (order <= maxOrder) {
      return statement;
    }
  }
  return { range: [0, 0] };
}

function hasNoSpecifiers(sourceCode: SourceCode, importStatement: TSESTree.ImportDeclaration) {
  return (
    importStatement.specifiers.length === 0 &&
    (importStatement.importKind === 'type'
      ? sourceCode.getFirstToken(importStatement, 2)?.type !== 'Punctuator'
      : sourceCode.getFirstToken(importStatement, 1)?.type !== 'Punctuator')
  );
}

function isAnyImportType(simpleType: SimpleType) {
  return simpleType === 'importModule' || simpleType === 'importType' || simpleType === 'import';
}

function isAnyExportType(simpleType: SimpleType) {
  return isExportType(simpleType) || isReexportType(simpleType);
}

function isExportType(simpleType: SimpleType): boolean {
  return simpleType === 'exportType' || simpleType === 'export';
}

function isReexportType(simpleType: SimpleType): boolean {
  return simpleType === 'reexportType' || simpleType === 'reexport';
}

const whitespaceRegexp = /\s/;

function getRangeWithCommentsAndWhitespace(sourceCode: SourceCode, node: TSESTree.Node): AST.Range {
  const text = sourceCode.getText();
  const tokenBefore = sourceCode.getTokenBefore(node as Node);
  const tokenAfter = sourceCode.getTokenAfter(node as Node);
  const commentsBefore = sourceCode.getCommentsBefore(node as Node).reverse() as TSESTree.Comment[];
  const commentsAfter = sourceCode.getCommentsAfter(node as Node) as TSESTree.Comment[];
  const minStartLine = tokenBefore ? tokenBefore.loc.end.line : 0;
  const maxEndLine = tokenAfter ? tokenAfter.loc.start.line : 0;
  let startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  let [start, end] = node.range;

  for (const comment of commentsBefore) {
    if (comment.loc.start.line <= minStartLine || comment.loc.end.line < startLine - 1) {
      break;
    }
    startLine = comment.loc.start.line;
    start = sourceCode.getIndexFromLoc(comment.loc.start);
  }
  for (const comment of commentsAfter) {
    if (comment.loc.end.line >= maxEndLine || comment.loc.start.line !== endLine) {
      break;
    }
    end = sourceCode.getIndexFromLoc(comment.loc.end);
  }
  while (end < text.length && whitespaceRegexp.test(text[end])) {
    end += 1;
  }
  if (
    (end < text.length && text[end] === '\n') ||
    (end + 1 < text.length && text.slice(end, end + 2) === '\r\n')
  ) {
    end += text[end] === '\n' ? 1 : 2;
  }
  return [start, end];
}

function getLocFromRange(sourceCode: SourceCode, range: AST.Range): AST.SourceLocation {
  return {
    start: sourceCode.getLocFromIndex(range[0]),
    end: sourceCode.getLocFromIndex(range[1]),
  };
}

function getTextFromRange(sourceCode: SourceCode, range: AST.Range): string {
  const text = sourceCode.getText();
  return text.slice(range[0], range[1]);
}
