'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var log = require('spm-log');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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

  var cssLoader = 'style!css';
  if (opts.extractCSS) {
    cssLoader = ExtractTextPlugin.extract('style-loader', 'css-loader');
  }

  var args = {
    output: {
      path: opts.dest || 'dist',
      filename: '[name].js'
    },
    module: {
      loaders: [
        { test: /\.jsx?$/, loader: 'jsx-loader' },
        { test: /\.css$/, loader: cssLoader },
        { test: /\.(png|jpe?g|gif)$/, loader: 'file' }
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

  if (opts.extractCSS) {
    args.plugins.push(new ExtractTextPlugin('[name].css', {
      disable: false,
      allChunks: true
    }));
  }

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
