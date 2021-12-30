"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
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
exports.rule = {
    meta: {
        type: 'layout',
        fixable: 'code',
        messages,
    },
    create: (context) => ({
        Program: (node) => {
            checkProgram(context, node);
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
];
const simpleTypeToOrder = Object.fromEntries(orderedSimpleTypes.map((type, index) => [type, index]));
function checkProgram(context, program) {
    const statementsWithTypes = [];
    for (const statement of program.body) {
        const simpleType = getSimpleType(statement);
        const lastSimpleType = getLastSimpleType(statementsWithTypes);
        const errorMessageId = lastSimpleType && getErrorMessageId(lastSimpleType, simpleType);
        if (errorMessageId) {
            const lastProperlyOrderedStatement = getLastProperlyOrderedStatement(statementsWithTypes, simpleType);
            const sourceCode = context.getSourceCode();
            const range = getRangeWithCommentsAndWhitespace(sourceCode, statement);
            context.report({
                loc: getLocFromRange(sourceCode, range),
                messageId: errorMessageId,
                fix: (fixer) => [
                    fixer.removeRange(range),
                    fixer.insertTextAfterRange(lastProperlyOrderedStatement.range, getTextFromRange(sourceCode, range)),
                ],
            });
        }
        statementsWithTypes.push([simpleType, statement]);
    }
}
function getSimpleType(statement) {
    return statement.type === 'ImportDeclaration'
        ? statement.specifiers.length === 0
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
function getErrorMessageId(lastSimpleType, simpleType) {
    if (lastSimpleType === 'statement' && isAnyImportType(simpleType)) {
        return 'importAfterStatement';
    }
    if (isAnyExportType(lastSimpleType) && isAnyImportType(simpleType)) {
        return 'importAfterExport';
    }
    if (lastSimpleType === 'import' && simpleType === 'importType') {
        return 'importTypeAfterImport';
    }
    if (isAnyImportType(lastSimpleType) &&
        lastSimpleType !== 'importModule' &&
        simpleType === 'importModule') {
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
function getLastProperlyOrderedStatement(statementsWithTypes, simpleType) {
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
function getLastSimpleType(statementsWithTypes) {
    return statementsWithTypes.length > 0
        ? statementsWithTypes[statementsWithTypes.length - 1][0]
        : undefined;
}
function isAnyImportType(simpleType) {
    return simpleType === 'importModule' || simpleType === 'importType' || simpleType === 'import';
}
function isAnyExportType(simpleType) {
    return isExportType(simpleType) || isReexportType(simpleType);
}
function isExportType(simpleType) {
    return simpleType === 'exportType' || simpleType === 'export';
}
function isReexportType(simpleType) {
    return simpleType === 'reexportType' || simpleType === 'reexport';
}
const whitespaceRegexp = /\s/;
function getRangeWithCommentsAndWhitespace(sourceCode, node) {
    const text = sourceCode.getText();
    const tokenBefore = sourceCode.getTokenBefore(node);
    const tokenAfter = sourceCode.getTokenAfter(node);
    const commentsBefore = sourceCode.getCommentsBefore(node).reverse();
    const commentsAfter = sourceCode.getCommentsAfter(node);
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
    if ((end < text.length && text[end] === '\n') ||
        (end + 1 < text.length && text.slice(end, end + 2) === '\r\n')) {
        end += text[end] === '\n' ? 1 : 2;
    }
    return [start, end];
}
function getLocFromRange(sourceCode, range) {
    return {
        start: sourceCode.getLocFromIndex(range[0]),
        end: sourceCode.getLocFromIndex(range[1]),
    };
}
function getTextFromRange(sourceCode, range) {
    const text = sourceCode.getText();
    return text.slice(range[0], range[1]);
}
