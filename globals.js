/**
 * Specifically restrict browser globals (but not globals shared with node) since they unreasonably
 * pollute the global scope.
 */

'use strict';

const globals = require('globals');

const restrictedTypes = new Set(['Text']);

exports.browserGlobals = toReadonlyGlobals(['document', 'window']);

exports.typescriptBrowserGlobals = toReadonlyGlobals(
  // Types are allowed because TypeScript puts everything into global scope (lib.dom.d.ts)
  Object.keys(globals.browser).filter((name) => /^[A-Z]/.test(name) && !restrictedTypes.has(name)),
);

exports.reactTypescriptBrowserGlobals = toReadonlyGlobals(['JSX']);

function toReadonlyGlobals(globals) {
  return Object.fromEntries(globals.map((global) => [global, 'readonly']));
}
