'use strict';

var join = require('path').join;
var dirname = require('path').dirname;
var log = require('spm-log');
var chokidar = require('chokidar');
var minify = require('html-minifier').minify;

module.exports = SPMPlugins;

function SPMPlugins(opts) {
  this.opts = opts;
}

SPMPlugins.prototype.apply = function(compiler) {
  var opts = this.opts;
  var copied;

  compiler.plugin('compile', function() {
    log.info('build', 'start');
  });

  compiler.plugin('done', function(stats) {
    var files = Object.keys(opts.files);
    if (!copied && files.length) {
      copied = true;
      copy(opts.files);

      // watch
      if (opts.watch) {
        var watcher = chokidar.watch(files[0]);
        watcher.add(files.slice(1));
        watcher.on('change', function(p) {
          log.info('changed', p);
          var f = {};
          f[p] = opts.files[p];
          copy(f);
        });
      }
    }

    function copy(files) {
      copyFiles(files, opts.outputPath, opts.cwd, compiler.outputFileSystem, opts.htmlMinify);
    }

    printResult(stats, opts);
    log.info('build', 'done');
  });

  compiler.plugin('emit', function(compilation, callback) {
    compilation.assets = compilation.assets || {};
    for (var k in compilation.assets || {}) {
      if (k.indexOf('_webpackcssentry_') !== 0) continue;
      if (require('path').extname(k) === '.js') delete compilation.assets[k];
      if (require('path').extname(k) === '.css') {
        var cssPath = k.replace('_webpackcssentry_', '');
        compilation.assets[cssPath] = compilation.assets[k];
        delete compilation.assets[k];
      }
    }
    callback && callback();
  });
};

function printResult(stats, opts) {
  log.debug('stats', '\n' + stats.toString());

  stats = stats.toJson();

  if (stats.errors && stats.errors.length) {
    var hasChildError = false;
    stats.children.forEach(function(item) {
      if (item.errors && item.errors.length) {
        hasChildError = true;
        item.errors.forEach(function(err) {
          log.error('error', err);
        });
      }
    });
    if (!hasChildError) {
      stats.errors.forEach(function(err) {
        log.error('error', err);
      });
    }
    console.log();
    if (!opts.watch) process.exit(1);
  }

  stats.assets.forEach(function(item) {
    var size = (item.size/1024.0).toFixed(2) + 'kB';
    if (item.name.indexOf('_webpackcssentry_') !== 0) {
      log.info('generated', item.name, size.to.magenta.color);
    }
  });
}

function copyFiles(files, destDir, cwd, fs, htmlMnify) {
  for (var k in files) {
    copyFile(k, files[k], destDir, cwd, fs, htmlMnify);
  }
}

function copyFile(file, destFile, destDir, cwd, fs, htmlMnify) {
  var _fs = require('fs');
  if (!fs || !fs.writeFileSync) {
    fs = _fs;
  }

  var ori = join(cwd, file);
  var target = join(destDir, destFile);
  if (fs.mkdirpSync) {
    fs.mkdirpSync(dirname(target));
  } else {
    require('mkdirp')(dirname(target));
  }
  var oriFile = htmlMnify && /\.(htm|html)$/.test(ori) ? minify(_fs.readFileSync(ori, 'utf8'), {
    removeComments: true,
    removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true
  }) : _fs.readFileSync(ori);
  var err = fs.writeFileSync(target, oriFile);
  if (err) {
    log.error('copy', err);
  } else {
    log.info('copy', file, 'to', destFile);
  }
  return err;
}
