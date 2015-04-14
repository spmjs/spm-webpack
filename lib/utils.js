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

exports.normalizeLoader = function(loader, opts, extname) {
  if (!opts.build || !opts.build.loader) return loader;
  var opt = opts.build.loader[extname] || opts.build.loader['.' + extname];
  if (!opt) return loader;

  loader = loader.split('!');
  opt = opt.split('!');

  opt.forEach(function(item) {
    switch (item.charAt(0)) {
      case '+':
        if (item.slice(-1) === '$') {
          loader.push(item.slice(1, -1));
        } else {
          loader.unshift(item.slice(1));
        }
        break;
      case '-':
        for (var i=0; i<loader.length; i++) {
          if (loader[i].split('?')[0] === item.slice(1).split('?')[0]) {
            loader.splice(i, 1);
            break;
          }
        }
        break;
      default:
        loader = [item];
        break;
    }
  });

  return loader.join('!');
};
