'use strict';

module.exports = CSSEntryPlugin;

function CSSEntryPlugin() {}

CSSEntryPlugin.prototype.apply = function(compiler) {

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
