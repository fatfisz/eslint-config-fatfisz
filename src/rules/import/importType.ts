import { TSESTree } from '@typescript-eslint/types';
import { SourceCode } from 'eslint';

export type ImportType = typeof orderedImportTypes[number];

const orderedImportTypes = [
  'moduleImport',
  'typeImport',
  'valueImport',
  'typeReexport',
  'valueReexport',
  'typeExport',
  'valueExport',
  'statement',
] as const;

export const importTypeToOrder = Object.fromEntries(
  orderedImportTypes.map((type, index) => [type, index]),
) as Record<ImportType, number>;

export function getImportType(
  sourceCode: SourceCode,
  statement: TSESTree.ProgramStatement,
): ImportType {
  return statement.type === 'ImportDeclaration'
    ? hasNoSpecifiers(sourceCode, statement)
      ? 'moduleImport'
      : statement.importKind === 'type'
      ? 'typeImport'
      : 'valueImport'
    : (statement.type === 'ExportNamedDeclaration' && !statement.declaration) ||
      statement.type === 'ExportAllDeclaration'
    ? statement.source
      ? statement.exportKind === 'type'
        ? 'typeReexport'
        : 'valueReexport'
      : statement.exportKind === 'type'
      ? 'typeExport'
      : 'valueExport'
    : 'statement';
}

export function isAnyImportType(importType: ImportType) {
  return (
    importType === 'moduleImport' || importType === 'typeImport' || importType === 'valueImport'
  );
}

export function isAnyExportType(importType: ImportType) {
  return isReexportType(importType) || isExportType(importType);
}

export function isReexportType(importType: ImportType): boolean {
  return importType === 'typeReexport' || importType === 'valueReexport';
}

export function isExportType(importType: ImportType): boolean {
  return importType === 'typeExport' || importType === 'valueExport';
}

function hasNoSpecifiers(sourceCode: SourceCode, importStatement: TSESTree.ImportDeclaration) {
  return (
    importStatement.specifiers.length === 0 &&
    (importStatement.importKind === 'type'
      ? sourceCode.getFirstToken(importStatement, 2)?.type !== 'Punctuator'
      : sourceCode.getFirstToken(importStatement, 1)?.type !== 'Punctuator')
  );
}
