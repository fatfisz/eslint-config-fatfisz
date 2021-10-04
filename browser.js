'use strict';

const {
  browserGlobals,
  reactTypescriptBrowserGlobals,
  typescriptBrowserGlobals,
} = require('./globals');
const { isPackageInstalled } = require('./isPackageInstalled');

const config = {
  globals: browserGlobals,
};

if (isPackageInstalled('typescript')) {
  Object.assign(config.globals, typescriptBrowserGlobals);
}

if (isPackageInstalled('react') && isPackageInstalled('typescript')) {
  Object.assign(config.globals, reactTypescriptBrowserGlobals);
}

module.exports = config;
