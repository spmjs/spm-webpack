'use strict';

module.exports = function(source) {
  this.cacheable && this.cacheable();
  return source
    .replace(/￥/g, '$');
};
