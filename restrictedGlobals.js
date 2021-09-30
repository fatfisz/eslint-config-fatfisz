/**
 * Specifically restrict browser globals (but not globals shared with node) since they unreasonably
 * pollute the global scope.
 */

'use strict';

const globals = require('globals');

const browserGlobals = Object.keys(globals.browser);
const sharedGlobals = new Set(Object.keys(globals['shared-node-browser']));

exports.restrictedGlobals = browserGlobals
  .filter((name) => !sharedGlobals.has(name))
  .map((name) => ({ name, message: `Use window.${name} instead.` }));
