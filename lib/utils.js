'use strict';

exports.getPrefix = function(pkg) {
  var ret = '';
  if (pkg) {
    if (pkg.name) {
      ret += pkg.name + '/';
    }
    if (pkg.version) {
      ret += pkg.version + '/';
    }
  }
  return ret;
};
