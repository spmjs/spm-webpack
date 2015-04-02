'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var uniq = require('uniq');
var glob = require('glob');
var extname = require('path').extname;
var basename = require('path').basename;

module.exports = function(cwd, pkg) {
  var files = [];

  if (exists(join(cwd, pkg.spm.main || 'index.js'))) {
    files.push(pkg.spm.main || 'index.js');
  }

  (pkg.spm.output || []).forEach(function(pattern) {
    var items = glob.sync(pattern, {cwd: cwd});
    items.forEach(function(item) {
      if (stat(join(cwd, item)).isFile()) {
        files.push(item);
      }
    });
  });

  return map(uniq(files), cwd);
};

function map(files, cwd) {
  var js = {};
  var css = {};
  var other = [];
  files.forEach(function(file) {
    var absFile = join(cwd, file);
    var ext = extname(file);
    var name = basename(file).slice(0, -ext.length);
    if (ext === '.js' || ext === '.coffee' || ext === '.jsx') {
      js[name] = absFile;
    } else if (ext === '.css') {
      css[name] = absFile;
    } else {
      other.push(file);
    }
  });
  return {js:js,other:other};
}
