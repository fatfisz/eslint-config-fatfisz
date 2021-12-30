"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDeps = void 0;
const isPackageInstalled_1 = require("./isPackageInstalled");
function checkDeps() {
    const missingPackages = [];
    if ((0, isPackageInstalled_1.isPackageInstalled)('react')) {
        checkRequiredPackages('eslint-plugin-react', 'eslint-plugin-react-hooks');
    }
    if ((0, isPackageInstalled_1.isPackageInstalled)('typescript')) {
        checkRequiredPackages('@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'typescript');
    }
    if (missingPackages.length > 0) {
        console.error(`
Error from eslint-config-fatfisz: some packages are missing
${missingPackages.map((missingPackage) => `- ${missingPackage}`).join('\n')}

Run \`yarn add -ED ${missingPackages.join(' ')}\`
  `);
    }
    function checkRequiredPackages(...requiredPackages) {
        missingPackages.push(...requiredPackages.filter((name) => !(0, isPackageInstalled_1.isPackageInstalled)(name)));
    }
}
exports.checkDeps = checkDeps;
