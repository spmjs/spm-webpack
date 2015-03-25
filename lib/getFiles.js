'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var uniq = require('uniq');
var glob = require('glob');
var extname = require('path').extname;

module.exports = function(cwd, pkg) {
  var files = [];

  if (exists(join(cwd, pkg.main || 'index.js'))) {
    files.push(join(cwd, pkg.main || 'index.js'));
  }

  (pkg.output || []).forEach(function(pattern) {
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
    if (ext === '.js' || ext === '.coffee' || ext === '.jsx') {
      js[file.replace(ext, '')] = absFile;
    } else if (ext === '.css') {
      css[file.replace(ext, '')] = absFile;
    } else {
      other.push(file);
    }
  });
  return {js:js,other:other};
}
