'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var glob = require('glob');
var extname = require('path').extname;
var basename = require('path').basename;
var log = require('spm-log');

module.exports = function(cwd, pkg) {
  var files = [];

  if (!pkg.spm) {
    log.error('error', '`spm` is not found in package.json');
  }

  if (exists(join(cwd, pkg.spm.main || 'index.js'))) {
    var main = pkg.spm.main || 'index.js';
    files.push({
      name: formatName(main),
      files: [main]
    });
  }

  if (pkg.spm.output && !Array.isArray(pkg.spm.output)) {
    log.error('error', '`output` in package.json is not a type of Array');
  }

  (pkg.spm.output || []).forEach(function(output) {
    if (typeof output === 'string') {
      (glob.sync(output, {cwd:cwd}) || []).forEach(function(item) {
        if (stat(join(cwd, item)).isFile()) {
          files.push({
            name: formatName(item),
            files: [item]
          });
        }
      });
    } else if (output && output.name && output.files) {
      files.push({
        name: formatName(output.name),
        files: output.files
      });
    }
  });

  return map(uniq(files), cwd);
};

function formatName(name) {
  return name.replace(/^\.\//g, '');
}

function uniq(files) {
  var ret = [];
  var tmp = {};
  files.forEach(function(file) {
    if (tmp[file.name]) return;
    tmp[file.name] = true;
    ret.push(file);
  });
  return ret;
}

function map(files, cwd) {
  var js = {};
  var other = [];
  var extractCSS = false;

  files.forEach(function(file) {
    var ext = extname(file.name);
    if (ext === '.js' || ext === '.coffee' || ext === '.jsx') {
      js[file.name.replace(new RegExp(ext + '$'), '')] = formatFiles(file.files, cwd);
    } else if (ext === '.css') {
      // Create js file to require css
      var fileName = '_webpackcssentry_' + basename(file.name.replace(/\//g, '^'), '.css');
      var jsFile = join(require('os').tmpdir(), fileName + '.js');
      var content = getCSSRequireContent(formatFiles(file.files, cwd));
      require('fs').writeFileSync(jsFile, content, 'utf-8');
      js[fileName] = jsFile;
      extractCSS = true;
    } else {
      other = other.concat(formatFiles(file.files));
    }
  });
  return {js:js,extractCSS:extractCSS,other:other};
}

function getCSSRequireContent(files) {
  if (!Array.isArray(files)) {
    files = [files];
  }
  return files.map(function(file) {
    return 'require("' + file + '");';
  }).join('\n');
}

function formatFiles(files, cwd) {
  files = files.map(function(file) {
    return cwd ? join(cwd, file) : file;
  });
  if (files.length === 1) files = files[0];
  return files;
}
