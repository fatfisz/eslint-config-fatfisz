/**
 * Specifically restrict browser globals (but not globals shared with node) since they unreasonably
 * pollute the global scope.
 */

'use strict';

const globals = require('globals');

const browserGlobals = Object.keys(globals.browser);
const allowedGlobals = new Set([
  ...Object.keys(globals['shared-node-browser']),
  // Types are allowed because TypeScript puts everything into global scope (lib.dom.d.ts)
  browserGlobals.filter((name) => /^[A-Z]/.test(name)),
  // Those are also allowed
  'document',
  'window',
]);

exports.restrictedGlobals = browserGlobals
  .filter((name) => !allowedGlobals.has(name))
  .map((name) => ({ name, message: `Use window.${name} instead.` }));
