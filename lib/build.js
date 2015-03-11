'use strict';

var join = require('path').join;
var log = require('spm-log');
var webpack = require('webpack');
var SPMWebpackPlugin = require('./SPMWebpackPlugin');

module.exports = function build(opts, callback) {
  require('./logArgs')(opts);

  var cwd = opts.cwd || process.cwd();

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

  if (opts.entry) {
    console.log('...', opts.entry);
    args.entry = require('./getFiles')(cwd, {output:opts.entry});
  } else {
    var pkg = opts.pkg || require(join(cwd, 'package.json'));
    args.entry = require('./getFiles')(cwd, pkg.spm);
  }
  log.info('entry', args.entry);

  webpack(args, function(err, stats) {
    if (err) log.error('error', err);
    console.log();
    console.log(stats.toString());
    console.log();
    callback(err);
  });

};
