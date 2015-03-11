'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var uniq = require('uniq');
var glob = require('glob');
var basename = require('path').basename;

module.exports = function(cwd, pkg) {
  var files = [];

  if (exists(join(cwd, pkg.main || 'index.js'))) {
    files.push(join(cwd, pkg.main));
  }

  (pkg.output || []).forEach(function(pattern) {
    var items = glob.sync(pattern, {cwd: cwd});
    items.forEach(function(item) {
      item = join(cwd, item);
      if (stat(item).isFile()) {
        files.push(item);
      }
    });
  });

  return map(uniq(files));
};

function map(files) {
  var ret = {};
  files.forEach(function(file) {
    var name = basename(file);
    ret[name] = file;
  });
  return ret;
}
