import { TSESTree } from '@typescript-eslint/types';
import { AST, Rule, SourceCode } from 'eslint';
import {
  getImportType,
  ImportType,
  importTypeToOrder,
  isAnyExportType,
  isAnyImportType,
  isExportType,
  isReexportType,
} from './util/importType';
import { getLocFromRange, getTextFromRange, getWholeRange } from './util/sourceCode';

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
  const sourceCode = context.getSourceCode();
  const statementsWithTypes: [ImportType, TSESTree.ProgramStatement][] = [];
  for (const statement of program.body) {
    const importType = getImportType(sourceCode, statement);
    const lastImportType = getLastImportType(statementsWithTypes);
    const errorMessageId = lastImportType && getErrorMessageId(lastImportType, importType);
    if (errorMessageId) {
      const previousRange = getLastProperlyOrderedStatementRange(
        sourceCode,
        statementsWithTypes,
        importType,
      );
      const range = getWholeRange(sourceCode, statement).withWhitespace;
      context.report({
        loc: getLocFromRange(sourceCode, range),
        messageId: errorMessageId,
        fix: (fixer) => [
          fixer.removeRange(range),
          fixer.insertTextAfterRange(previousRange, getTextFromRange(sourceCode, range)),
        ],
      });
    }
    statementsWithTypes.push([importType, statement]);
  }
}

function getErrorMessageId(
  lastimportType: ImportType,
  importType: ImportType,
): Message | undefined {
  if (lastimportType === 'statement' && isAnyImportType(importType)) {
    return 'importAfterStatement';
  }
  if (isAnyExportType(lastimportType) && isAnyImportType(importType)) {
    return 'importAfterExport';
  }
  if (lastimportType === 'valueImport' && importType === 'typeImport') {
    return 'importTypeAfterImport';
  }
  if (
    isAnyImportType(lastimportType) &&
    lastimportType !== 'moduleImport' &&
    importType === 'moduleImport'
  ) {
    return 'importModuleAfterImport';
  }
  if (lastimportType === 'statement' && isAnyExportType(importType)) {
    return 'exportAfterStatement';
  }
  if (isExportType(lastimportType) && isReexportType(importType)) {
    return 'reexportAfterExport';
  }
  if (lastimportType === 'valueExport' && importType === 'typeExport') {
    return 'exportTypeAfterExport';
  }
  if (lastimportType === 'valueReexport' && importType === 'typeReexport') {
    return 'reexportTypeAfterReexport';
  }
}

function getLastImportType(
  statementsWithTypes: [ImportType, TSESTree.ProgramStatement][],
): ImportType | undefined {
  return statementsWithTypes.length > 0
    ? statementsWithTypes[statementsWithTypes.length - 1][0]
    : undefined;
}

function getLastProperlyOrderedStatementRange(
  sourceCode: SourceCode,
  statementsWithTypes: [ImportType, TSESTree.ProgramStatement][],
  importType: ImportType,
): AST.Range {
  const maxOrder = importTypeToOrder[importType];
  for (let index = statementsWithTypes.length - 1; index >= 0; index -= 1) {
    const [importType, statement] = statementsWithTypes[index];
    const order = importTypeToOrder[importType];
    if (order <= maxOrder) {
      return getWholeRange(sourceCode, statement).withWhitespace;
    }
  }
  return [0, 0];
}
