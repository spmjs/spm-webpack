'use strict';

module.exports = function(source) {
  this.cacheable && this.cacheable();
  return source
    .replace('bar', 'boo')
    .replace(1, '\"foo\"');
};
