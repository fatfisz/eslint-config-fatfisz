"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPackageInstalled = void 0;
function isPackageInstalled(name) {
    try {
        require.resolve(name);
        return true;
    }
    catch {
        return false;
    }
}
exports.isPackageInstalled = isPackageInstalled;
