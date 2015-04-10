'use strict';

var RawSource = require('webpack-core/lib/RawSource');
var resources = require('css-resources');

module.exports = FixCSSPathPlugin;

function FixCSSPathPlugin() {}

FixCSSPathPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    fixCSS(compilation.assets);
    callback();
  });
};

function fixCSS(assets) {
  var cssFiles = Object.keys(assets).filter(function(item) {
    return /\.css$/.test(item);
  });

  cssFiles.forEach(function(cssFile) {
    var file = assets[cssFile];
    var code = resources(file.source(), function(item) {
      var newPath = resolve(item.path, cssFile);
      if (item.path === newPath) {
        return item.string;
      } else {
        return 'url("'+newPath+'");';
      }
    });
    assets[cssFile] = new RawSource(code);
  });

  function resolve(item, cssFile) {
    if (!assets[item.split('?')[0].split('#')[0]]) return item;
    var len = cssFile.split('/').length;
    if (len <= 2) return item;
    return new Array(len - 1).join('../') + item;
  }
}

