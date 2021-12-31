"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExportType = exports.isReexportType = exports.isAnyExportType = exports.isAnyImportType = exports.getImportType = exports.importTypeToOrder = void 0;
const orderedImportTypes = [
    'moduleImport',
    'typeImport',
    'valueImport',
    'typeReexport',
    'valueReexport',
    'typeExport',
    'valueExport',
    'statement',
];
exports.importTypeToOrder = Object.fromEntries(orderedImportTypes.map((type, index) => [type, index]));
function getImportType(sourceCode, statement) {
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
exports.getImportType = getImportType;
function isAnyImportType(importType) {
    return (importType === 'moduleImport' || importType === 'typeImport' || importType === 'valueImport');
}
exports.isAnyImportType = isAnyImportType;
function isAnyExportType(importType) {
    return isReexportType(importType) || isExportType(importType);
}
exports.isAnyExportType = isAnyExportType;
function isReexportType(importType) {
    return importType === 'typeReexport' || importType === 'valueReexport';
}
exports.isReexportType = isReexportType;
function isExportType(importType) {
    return importType === 'typeExport' || importType === 'valueExport';
}
exports.isExportType = isExportType;
function hasNoSpecifiers(sourceCode, importStatement) {
    return (importStatement.specifiers.length === 0 &&
        (importStatement.importKind === 'type'
            ? sourceCode.getFirstToken(importStatement, 2)?.type !== 'Punctuator'
            : sourceCode.getFirstToken(importStatement, 1)?.type !== 'Punctuator'));
}
