'use strict';

var globals = require('globals');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var globals__default = /*#__PURE__*/_interopDefaultLegacy(globals);

function isPackageInstalled(name) {
    try {
        require.resolve(name);
        return true;
    }
    catch {
        return false;
    }
}

function checkDeps() {
    const missingPackages = [];
    if (isPackageInstalled('react')) {
        checkRequiredPackages('eslint-plugin-react', 'eslint-plugin-react-hooks');
    }
    if (isPackageInstalled('typescript')) {
        checkRequiredPackages('@typescript-eslint/eslint-plugin', '@typescript-eslint/parser');
    }
    if (missingPackages.length > 0) {
        console.error(`
Error from eslint-config-fatfisz: some packages are missing
${missingPackages.map((missingPackage) => `- ${missingPackage}`).join('\n')}

Run \`yarn add -ED ${missingPackages.join(' ')}\`
  `);
    }
    function checkRequiredPackages(...requiredPackages) {
        missingPackages.push(...requiredPackages.filter((name) => !isPackageInstalled(name)));
    }
}

/**
 * Specifically restrict browser globals (but not globals shared with node) since they unreasonably
 * pollute the global scope.
 */
const browserGlobals = Object.keys(globals__default["default"].browser);
const blacklist = new Set(['Text']);
const whitelist = new Set([
    ...Object.keys(globals__default["default"]['shared-node-browser']),
    // Types are allowed because TypeScript puts everything into global scope (lib.dom.d.ts)
    ...browserGlobals.filter((name) => /^[A-Z]/.test(name)),
    // Those are also allowed
    'document',
    'window',
]);
const restrictedGlobals = browserGlobals
    .filter((name) => blacklist.has(name) || !whitelist.has(name))
    .map((name) => ({ name, message: `Use window.${name} instead.` }));

checkDeps();
const config = {
    settings: {},
    extends: ['eslint:recommended', 'prettier'],
    plugins: ['fatfisz', 'prettier'],
    env: { es2020: true, 'shared-node-browser': true },
    parserOptions: {
        ecmaVersion: 2020,
    },
    reportUnusedDisableDirectives: true,
    rules: {
        curly: 'warn',
        'no-empty': ['warn', { allowEmptyCatch: true }],
        'no-prototype-builtins': 'off',
        'no-restricted-globals': ['warn', ...restrictedGlobals],
        'no-sparse-arrays': 'off',
        'no-unreachable': 'warn',
        'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
        'no-useless-rename': 'warn',
        'object-shorthand': 'warn',
        'padding-line-between-statements': [
            'warn',
            { blankLine: 'always', prev: '*', next: 'directive' },
            { blankLine: 'always', prev: 'directive', next: '*' },
            { blankLine: 'never', prev: 'directive', next: 'directive' },
            { blankLine: 'always', prev: '*', next: 'function' },
            { blankLine: 'always', prev: 'function', next: '*' },
        ],
        quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
        'sort-imports': [
            'warn',
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
            },
        ],
        strict: ['warn', 'global'],
        'prettier/prettier': [
            'warn',
            {
                printWidth: 100,
                singleQuote: true,
                trailingComma: 'all',
            },
        ],
        'fatfisz/import/first': 'warn',
        'fatfisz/import/sort': 'warn',
    },
    overrides: [
        {
            files: '.eslintrc.js',
            env: { node: true },
        },
        {
            files: '**/*.js',
            parserOptions: { sourceType: 'script' },
            rules: {},
        },
        {
            files: '**/*.json',
            rules: { quotes: 'off' },
        },
    ],
};
if (isPackageInstalled('react')) {
    config.settings.react = { version: 'detect' };
    config.extends.push('plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:react-hooks/recommended');
    Object.assign(config.rules, {
        'react/jsx-curly-brace-presence': ['warn', 'never'],
        /**
         * The way this rule is implemented makes it overly restrictive, eg. elements in an array
         * passed to a component that wraps them in elements with their own keys will also get
         * a warning. Since React warns about it in the console, it's better to rely on it rather than
         * on a broken rule.
         */
        'react/jsx-key': 'off',
        // Overly restrictive for React.createElement, not possible to configure to turn it off in that case
        'react/no-children-prop': 'off',
        'react/prop-types': 'warn',
    });
}
if (isPackageInstalled('typescript')) {
    config.extends.push('plugin:@typescript-eslint/recommended');
    config.parser = '@typescript-eslint/parser';
    config.plugins.push('@typescript-eslint');
    Object.assign(config.rules, {
        '@typescript-eslint/array-type': ['warn', { default: 'array' }],
        '@typescript-eslint/ban-ts-comment': 'off',
        // {} might be too permissive, but I often need it in intersections with other types where it's ok
        '@typescript-eslint/ban-types': ['warn', { types: { '{}': false } }],
        '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-var-requires': 'off',
        'no-unused-vars': 'off',
    });
    Object.assign(config.overrides.find((override) => override.files === '**/*.js')?.rules, {
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    });
    config.overrides.push({
        files: '**/*.d.ts',
        rules: { 'import/no-default-export': 'off' },
    });
}
if (isPackageInstalled('react') && isPackageInstalled('typescript')) {
    config.rules['react/prop-types'] = 'off';
}
if (isPackageInstalled('jest')) {
    const restrictedMessage = 'Do merge tests that are a work in progress.';
    config.overrides.push({
        files: '**/*.test.*',
        env: { jest: true },
        rules: {
            'no-restricted-globals': [
                'warn',
                ...restrictedGlobals,
                { name: 'fdescribe', message: restrictedMessage },
                { name: 'fit', message: restrictedMessage },
                { name: 'xdescribe', message: restrictedMessage },
                { name: 'xit', message: restrictedMessage },
                { name: 'xtest', message: restrictedMessage },
            ],
            'no-restricted-properties': [
                'warn',
                { object: 'describe', property: 'only', message: restrictedMessage },
                { object: 'describe', property: 'skip', message: restrictedMessage },
                { object: 'describe', property: 'todo', message: restrictedMessage },
                { object: 'it', property: 'only', message: restrictedMessage },
                { object: 'it', property: 'skip', message: restrictedMessage },
                { object: 'it', property: 'todo', message: restrictedMessage },
                { object: 'test', property: 'only', message: restrictedMessage },
                { object: 'test', property: 'skip', message: restrictedMessage },
                { object: 'test', property: 'todo', message: restrictedMessage },
            ],
        },
    });
}
if (isPackageInstalled('next')) {
    config.overrides.push({
        files: 'pages/**',
        rules: { 'import/no-default-export': 'off' },
    }, {
        files: ['next.config.js', 'pages/api/**'],
        env: { node: true },
    });
}
if (isPackageInstalled('rollup')) {
    config.overrides.push({
        files: 'rollup.config.js',
        parserOptions: { sourceType: 'module' },
        rules: { 'import/no-default-export': 'off' },
    });
}
if (isPackageInstalled('@storybook/core')) {
    config.overrides.push({
        files: '**/*.stories.tsx',
        rules: { 'import/no-default-export': 'off' },
    }, {
        files: '.storybook/**',
        excludedFiles: '.storybook/main.js',
        parserOptions: { sourceType: 'module' },
    }, {
        files: '.storybook/main.js',
        env: { node: true },
    });
}

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
const importTypeToOrder = Object.fromEntries(orderedImportTypes.map((type, index) => [type, index]));
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
function getImportSource(statement) {
    return statement.type === 'ImportDeclaration' ||
        statement.type === 'ExportNamedDeclaration' ||
        statement.type === 'ExportAllDeclaration'
        ? statement.source
        : null;
}
function isAnyImportType(importType) {
    return (importType === 'moduleImport' || importType === 'typeImport' || importType === 'valueImport');
}
function isAnyExportType(importType) {
    return isReexportType(importType) || isExportType(importType);
}
function isReexportType(importType) {
    return importType === 'typeReexport' || importType === 'valueReexport';
}
function isExportType(importType) {
    return importType === 'typeExport' || importType === 'valueExport';
}
function hasNoSpecifiers(sourceCode, importStatement) {
    return (importStatement.specifiers.length === 0 &&
        (importStatement.importKind === 'type'
            ? sourceCode.getFirstToken(importStatement, 2)?.type !== 'Punctuator'
            : sourceCode.getFirstToken(importStatement, 1)?.type !== 'Punctuator'));
}

const whitespaceRegexp = /[^\S\n\r]/;
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
const rule$1 = {
    meta: {
        type: 'layout',
        fixable: 'code',
        messages,
    },
    create: (context) => ({
        Program: (node) => {
            checkProgram$1(context, node);
        },
    }),
};
function checkProgram$1(context, program) {
    const sourceCode = context.getSourceCode();
    const statementsWithTypes = [];
    for (const statement of program.body) {
        const importType = getImportType(sourceCode, statement);
        const lastImportType = getLastImportType(statementsWithTypes);
        const errorMessageId = lastImportType && getErrorMessageId(lastImportType, importType);
        if (errorMessageId) {
            const lastProperlyOrderedStatement = getLastProperlyOrderedStatement(statementsWithTypes, importType);
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
        statementsWithTypes.push([importType, statement]);
    }
}
function getErrorMessageId(lastimportType, importType) {
    if (lastimportType === 'statement' && isAnyImportType(importType)) {
        return 'importAfterStatement';
    }
    if (isAnyExportType(lastimportType) && isAnyImportType(importType)) {
        return 'importAfterExport';
    }
    if (lastimportType === 'valueImport' && importType === 'typeImport') {
        return 'importTypeAfterImport';
    }
    if (isAnyImportType(lastimportType) &&
        lastimportType !== 'moduleImport' &&
        importType === 'moduleImport') {
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
function getLastImportType(statementsWithTypes) {
    return statementsWithTypes.length > 0
        ? statementsWithTypes[statementsWithTypes.length - 1][0]
        : undefined;
}
function getLastProperlyOrderedStatement(statementsWithTypes, importType) {
    const maxOrder = importTypeToOrder[importType];
    for (let index = statementsWithTypes.length - 1; index >= 0; index -= 1) {
        const [importType, statement] = statementsWithTypes[index];
        const order = importTypeToOrder[importType];
        if (order <= maxOrder) {
            return statement;
        }
    }
    return { range: [0, 0] };
}

const rule = {
    meta: {
        type: 'layout',
        fixable: 'code',
        messages: {
            wrongOrder: 'Imports and exports should be sorted by path',
        },
    },
    create: (context) => ({
        Program: (node) => {
            checkProgram(context, node);
        },
    }),
};
function checkProgram(context, program) {
    const sourceCode = context.getSourceCode();
    const statementsWithPaths = [];
    let currentImportType;
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
function checkOrder(context, statementsWithPaths) {
    const sourceCode = context.getSourceCode();
    const sortedStatementsWithPaths = [...statementsWithPaths].sort(([pathA], [pathB]) => collator.compare(pathA, pathB));
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
                    fixer.insertTextBeforeRange(getRangeWithCommentsAndWhitespace(sourceCode, actual), getTextFromRange(sourceCode, range)),
                ],
            });
            return;
        }
    }
}

module.exports = {
    configs: {
        config,
    },
    rules: {
        'import/first': rule$1,
        'import/sort': rule,
    },
};
