'use strict';

exports.getLib = function getLib() {
  delete require.cache[require.resolve('../lib')];
  return require('../lib');
};
