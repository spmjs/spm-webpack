'use strict';

var join = require('path').join;
var log = require('spm-log');
var extend = require('extend');
var webpack = require('webpack');

var SPMWebpackPlugin = require('./SPMWebpackPlugin');
var getFiles = require('./getFiles');
var getArgs = require('./getArgs');

module.exports = function build(opts, callback) {
  var cwd = opts.cwd || process.cwd();

  // Get pkg.
  var pkg = opts.pkg;
  if (!pkg && exists(join(cwd, 'package.json'))) {
    pkg = require(join(cwd, 'package.json'));
  }

  opts = getArgs(opts, pkg);

  var args = {
    output: {
      path: opts.dest || 'dist',
      filename: '[name]'
    },
    module: {
      loaders: [
        //{ test: /\.(png|jpe?g|gif|html?)$/, loader: 'file' }
      ]
    },
    plugins: [
      new SPMWebpackPlugin(opts.cwd)
      //new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
      //new webpack.ContextReplacementPlugin(/moment[\\\/]lang$/, /^\.\/(zh-cn)$/)
      //new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/)
      //new webpack.optimize.UglifyJsPlugin({
      //  compress: {
      //    warnings: false
      //  }
      //})
    ]
  };

  args.externals = opts.global;

  if (opts.entry) {
    args.entry = getFiles(cwd, {output:opts.entry});
  } else {
    args.entry = getFiles(cwd, pkg.spm);
  }

  require('./logArgs')(args);

  webpack(args, function(err, stats) {
    if (err) log.error('error', err);
    console.log();
    console.log(stats.toString());
    console.log();
    callback(err);
  });

};
