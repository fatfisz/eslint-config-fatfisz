"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const getRangeWithCommentsAndWhitespace_1 = require("./getRangeWithCommentsAndWhitespace");
const importType_1 = require("./importType");
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
function checkProgram(context, program) {
    const statementsWithTypes = [];
    for (const statement of program.body) {
        const sourceCode = context.getSourceCode();
        const simpleType = (0, importType_1.getImportType)(sourceCode, statement);
        const lastSimpleType = getLastSimpleType(statementsWithTypes);
        const errorMessageId = lastSimpleType && getErrorMessageId(lastSimpleType, simpleType);
        if (errorMessageId) {
            const lastProperlyOrderedStatement = getLastProperlyOrderedStatement(statementsWithTypes, simpleType);
            const range = (0, getRangeWithCommentsAndWhitespace_1.getRangeWithCommentsAndWhitespace)(sourceCode, statement);
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
function getErrorMessageId(lastSimpleType, simpleType) {
    if (lastSimpleType === 'statement' && (0, importType_1.isAnyImportType)(simpleType)) {
        return 'importAfterStatement';
    }
    if ((0, importType_1.isAnyExportType)(lastSimpleType) && (0, importType_1.isAnyImportType)(simpleType)) {
        return 'importAfterExport';
    }
    if (lastSimpleType === 'valueImport' && simpleType === 'typeImport') {
        return 'importTypeAfterImport';
    }
    if ((0, importType_1.isAnyImportType)(lastSimpleType) &&
        lastSimpleType !== 'moduleImport' &&
        simpleType === 'moduleImport') {
        return 'importModuleAfterImport';
    }
    if (lastSimpleType === 'statement' && (0, importType_1.isAnyExportType)(simpleType)) {
        return 'exportAfterStatement';
    }
    if ((0, importType_1.isExportType)(lastSimpleType) && (0, importType_1.isReexportType)(simpleType)) {
        return 'reexportAfterExport';
    }
    if (lastSimpleType === 'valueExport' && simpleType === 'typeExport') {
        return 'exportTypeAfterExport';
    }
    if (lastSimpleType === 'valueReexport' && simpleType === 'typeReexport') {
        return 'reexportTypeAfterReexport';
    }
}
function getLastSimpleType(statementsWithTypes) {
    return statementsWithTypes.length > 0
        ? statementsWithTypes[statementsWithTypes.length - 1][0]
        : undefined;
}
function getLastProperlyOrderedStatement(statementsWithTypes, simpleType) {
    const maxOrder = importType_1.importTypeToOrder[simpleType];
    for (let index = statementsWithTypes.length - 1; index >= 0; index -= 1) {
        const [simpleType, statement] = statementsWithTypes[index];
        const order = importType_1.importTypeToOrder[simpleType];
        if (order <= maxOrder) {
            return statement;
        }
    }
    return { range: [0, 0] };
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
