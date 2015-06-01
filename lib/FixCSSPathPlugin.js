'use strict';

var RawSource = require('webpack-core/lib/RawSource');
var resources = require('css-resources');
var path = require('path');

module.exports = FixCSSPathPlugin;

function FixCSSPathPlugin() {}

FixCSSPathPlugin.prototype.apply = function(compiler) {

  var pkgOpts = compiler.options.pkg || {};
  compiler.plugin('emit', function(compilation, callback) {
    fixCSS(pkgOpts, compilation.assets);
    callback();
  });

};

//initAssets more info https://github.com/spmjs/spm/issues/1293
var initAssets = null;

function fixCSS(pkgOpts, assets) {
  if (!initAssets) initAssets = assets;

  var name = (pkgOpts && pkgOpts.name) || '';
  var version =  (pkgOpts && pkgOpts.version) || '';
  var isNeedFix = !!name || !!version;
  if (isNeedFix){
    var prefix =  '';
    if (!!name && !!version){
      prefix = name+'/'+version+'/';
    }
    else if (!!name){
      prefix = name+'/';
    }
    else if (!!version){
      prefix = version+'/';
    }
    // 图片和字体文件
    var resourcesSet =[];
  }
  var cssFiles = Object.keys(assets).filter(function(item) {
    var isCssFile = /\.css$/.test(item);
    if (!isCssFile && isNeedFix){
      if(/\.jpeg|jpg|gif|bmp|png|pdf|eot|ttf|woff|svg$/i.test(item)){
        resourcesSet.push(item);
      }
    }
    return isCssFile;
  });
  //含有版本信息时需要修复assets对象图片和字体路径
  if (isNeedFix) {
    resourcesSet.forEach(function (resource) {
      var _file = assets[resource];
      assets[prefix+resource] = _file;
      delete assets[resource];
    });
  }



  cssFiles.forEach(function(cssFile) {
    var file = assets[cssFile];
    var code = resources(file.source(), function(item) {
      var newPath = resolve(version, item, cssFile);
      if (item.path === newPath) {
        return item.string;
      } else {
        return 'url("'+newPath+'")';
      }
    });
    assets[cssFile] = new RawSource(code);
  });



  function resolve(version, item, cssFile) {
    var itemPath = item.path.split('?')[0].split('#')[0];
    if (isNeedFix){
      itemPath = prefix + itemPath;
    }
    if (!assets[itemPath] && !initAssets[itemPath]) return item.path;

    cssFile = path.normalize(cssFile);
    if (isNeedFix){
      cssFile = cssFile.replace(prefix,'');
    }

    var len = cssFile.split('/').length;
    if (len <= 1) return item.path;
    return new Array(len).join('../') + item.path;
  }
}

