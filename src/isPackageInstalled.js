'use strict';

exports.isPackageInstalled = function isPackageInstalled(name) {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
};
