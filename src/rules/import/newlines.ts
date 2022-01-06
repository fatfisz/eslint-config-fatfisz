import { TSESTree } from '@typescript-eslint/types';
import { Rule } from 'eslint';
import { assertNever } from 'assertNever';
import { getImportSource, getImportType, ImportType } from './util/importType';
import { getPackagesFromSettings } from './util/settings';
import { getRangeWithCommentsAndWhitespace } from './util/sourceCode';

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
  const packages = getPackagesFromSettings(context);
  const sourceCode = context.getSourceCode();
  let previousStatement: TSESTree.ProgramStatement | undefined;
  let previousGroup: number | undefined;
  for (const statement of program.body) {
    const importType = getImportType(sourceCode, statement);
    const importSource = getImportSource(statement);
    const group = getGroup(packages, importType, importSource);
    if (previousStatement) {
      const previousRange = getRangeWithCommentsAndWhitespace(sourceCode, previousStatement);
      const range = getRangeWithCommentsAndWhitespace(sourceCode, statement);
      const endLine = sourceCode.getLocFromIndex(previousRange[1] - 1).line;
      const startLine = sourceCode.getLocFromIndex(range[0]).line;
      const diff = startLine - endLine;
      if (group === previousGroup && diff > 1) {
        // must not have an empty line that's not a part of a comment
      } else if (group !== previousGroup && diff <= 1) {
        // must have an empty line that's not a part of a comment
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
// function getGroup(packages: Set<string>,  path: string): number {
//   return packages.has(path) ? 0 : 1;
// }
