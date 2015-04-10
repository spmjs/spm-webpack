'use strict';

var resolve = require('path').resolve;
var spmArgv = require('spm-argv');
var extend = require('extend');

var defaults = {
  build: {
    dest: 'dist',
    force: false,
    install: true,
    uglify: {
      sourceMap: false,
      output: {
        ascii_only: true,
        comments: false
      }
    }
  }
};

module.exports = function(opts, pkg) {
  var args = extend(true, {}, defaults, spmArgv(opts.cwd, { pkg: pkg }), {build:opts});

  if (typeof args.build.entry === 'string') {
    args.build.entry = [args.build.entry];
  }
  args.build.dest = resolve(opts.cwd, args.build.dest);

  return args;
};
