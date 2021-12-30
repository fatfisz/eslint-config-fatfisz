"use strict";
/**
 * Specifically restrict browser globals (but not globals shared with node) since they unreasonably
 * pollute the global scope.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictedGlobals = void 0;
const globals_1 = __importDefault(require("globals"));
const browserGlobals = Object.keys(globals_1.default.browser);
const blacklist = new Set(['Text']);
const whitelist = new Set([
    ...Object.keys(globals_1.default['shared-node-browser']),
    // Types are allowed because TypeScript puts everything into global scope (lib.dom.d.ts)
    ...browserGlobals.filter((name) => /^[A-Z]/.test(name)),
    // Those are also allowed
    'document',
    'window',
]);
exports.restrictedGlobals = browserGlobals
    .filter((name) => blacklist.has(name) || !whitelist.has(name))
    .map((name) => ({ name, message: `Use window.${name} instead.` }));
