import { TSESTree } from '@typescript-eslint/types';
import { AST, Rule, SourceCode } from 'eslint';
import { getRangeWithCommentsAndWhitespace } from './getRangeWithCommentsAndWhitespace';
import {
  getImportType,
  ImportType,
  importTypeToOrder,
  isAnyExportType,
  isAnyImportType,
  isExportType,
  isReexportType,
} from './importType';

type Message = keyof typeof messages;

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

function checkProgram(context: Rule.RuleContext, program: TSESTree.Program) {
  const statementsWithTypes: [ImportType, TSESTree.ProgramStatement][] = [];
  for (const statement of program.body) {
    const sourceCode = context.getSourceCode();
    const simpleType = getImportType(sourceCode, statement);
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

function getErrorMessageId(
  lastSimpleType: ImportType,
  simpleType: ImportType,
): Message | undefined {
  if (lastSimpleType === 'statement' && isAnyImportType(simpleType)) {
    return 'importAfterStatement';
  }
  if (isAnyExportType(lastSimpleType) && isAnyImportType(simpleType)) {
    return 'importAfterExport';
  }
  if (lastSimpleType === 'valueImport' && simpleType === 'typeImport') {
    return 'importTypeAfterImport';
  }
  if (
    isAnyImportType(lastSimpleType) &&
    lastSimpleType !== 'moduleImport' &&
    simpleType === 'moduleImport'
  ) {
    return 'importModuleAfterImport';
  }
  if (lastSimpleType === 'statement' && isAnyExportType(simpleType)) {
    return 'exportAfterStatement';
  }
  if (isExportType(lastSimpleType) && isReexportType(simpleType)) {
    return 'reexportAfterExport';
  }
  if (lastSimpleType === 'valueExport' && simpleType === 'typeExport') {
    return 'exportTypeAfterExport';
  }
  if (lastSimpleType === 'valueReexport' && simpleType === 'typeReexport') {
    return 'reexportTypeAfterReexport';
  }
}

function getLastSimpleType(
  statementsWithTypes: [ImportType, TSESTree.ProgramStatement][],
): ImportType | undefined {
  return statementsWithTypes.length > 0
    ? statementsWithTypes[statementsWithTypes.length - 1][0]
    : undefined;
}

function getLastProperlyOrderedStatement(
  statementsWithTypes: [ImportType, TSESTree.ProgramStatement][],
  simpleType: ImportType,
): { range: AST.Range } {
  const maxOrder = importTypeToOrder[simpleType];
  for (let index = statementsWithTypes.length - 1; index >= 0; index -= 1) {
    const [simpleType, statement] = statementsWithTypes[index];
    const order = importTypeToOrder[simpleType];
    if (order <= maxOrder) {
      return statement;
    }
  }
  return { range: [0, 0] };
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
