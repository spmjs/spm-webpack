'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var stat = require('fs').statSync;
var glob = require('glob');
var extname = require('path').extname;
var log = require('spm-log');

module.exports = function(cwd, pkg, pathmap) {
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

  return map(uniq(files), cwd, pathmap);
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

function map(files, cwd, pathmap) {
  var js = {};
  var other = {};
  var extractCSS = false;

  files.forEach(function(file) {
    var ext = extname(file.name);
    if (ext === '.js' || ext === '.coffee' || ext === '.jsx') {
      var key;
      key = file.name.replace(new RegExp(ext + '$'), '');
      key = formatOutputPath(key, pathmap);
      js[key] = formatFiles(file.files, cwd);
    } else if (ext === '.css' || ext === '.less') {
      // Create js file to require css
      var f = file.name.replace(/\.(css|less)$/, '');
      f = formatOutputPath(f, pathmap);
      var fileName = '_webpackcssentry_' + f;
      var jsFile = join(require('os').tmpdir(), fileName + '.js');
      var content = getCSSRequireContent(formatFiles(file.files, cwd));
      require('fs-extra').outputFileSync(jsFile, content, 'utf-8');
      js[fileName] = jsFile;
      extractCSS = true;
    } else {
      var f2 = formatFiles(file.files);
      if (!Array.isArray(f2)) {
        f2 = [f2];
      }
      f2.forEach(function(f) {
        if (f.charAt(0) === '.') {
          f = f.slice(2);
        }
        other[f] = formatOutputPath(f, pathmap);
      });
    }
  });
  return {js:js,extractCSS:extractCSS,other:other};
}

function formatOutputPath(entry, map) {
  if (!map || !map.length) return entry;
  if (!Array.isArray(map[0])) {
    map = [map];
  }
  map.forEach(function(m) {
    entry = entry.replace(new RegExp(m[0]), m[1]);
  });
  return entry;
}

function getCSSRequireContent(files) {
  if (!Array.isArray(files)) {
    files = [files];
  }
  return files.map(function(file) {
    return 'require("' + winPath(file) + '");';
  }).join('\n');
}

function formatFiles(files, cwd) {
  files = files.map(function(file) {
    return cwd ? join(cwd, file) : file;
  });
  return files;
}

function winPath(path) {
  return path.replace(/\\/g, '/');
}
