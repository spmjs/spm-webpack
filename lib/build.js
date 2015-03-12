'use strict';

var join = require('path').join;
var exists = require('fs').existsSync;
var log = require('spm-log');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var SPMWebpackPlugin = require('./SPMWebpackPlugin');
var getFiles = require('./getFiles');
var getArgs = require('./getArgs');

var co = require('co');
var install = co(require('spm-client').install);

module.exports = function build(opts, callback) {
  var cwd = opts.cwd || process.cwd();

  // Get pkg.
  var pkg = opts.pkg;
  if (!pkg && exists(join(cwd, 'package.json'))) {
    pkg = require(join(cwd, 'package.json'));
  }

  opts = getArgs(opts, pkg);

  // Get deps to install.
  var query = [];
  if (pkg && pkg.spm && pkg.spm.dependencies) {
    for (var k in pkg.spm.dependencies) {
      query.push(k+'@'+pkg.spm.dependencies[k]);
    }
  }

  install({
    name: query,
    cwd: cwd,
    force: opts.force,
    registry: pkg && pkg.spm && pkg.spm.registry
  }, function(err) {
    if (err) {
      log.error('exit', err.message);
      console.log();
      process.exit(1);
    }

    var css = 'css';
    if (!opts.debug) css = css + '?minimize';
    if (opts.autoprefixer) css = css + '!autoprefixer';
    var cssLoader = 'style!' + css;
    var lessLoader = 'style!'+css+'!less';
    if (opts.extractCSS) {
      cssLoader = ExtractTextPlugin.extract('style', css);
      lessLoader = ExtractTextPlugin.extract('style', css+'!less');
    }

    var babel = opts.babel ? 'babel!' : '';

    var args = {
      resolveLoader: {
        root: join(__dirname, '../node_modules')
      },
      output: {
        path: opts.dest || 'dist',
        filename: '[name].js',
        chunkFilename: '[name].js'
      },
      module: {
        loaders: [
          { test: /\.js$/, loader: babel + 'jsx' },
          { test: /\.jsx$/, loader: 'jsx' },
          { test: /\.handlebars$/, loader: 'handlebars' },
          { test: /\.css$/, loader: cssLoader },
          { test: /\.less$/, loader: lessLoader },
          { test: /\.(png|jpe?g|gif)$/, loader: 'file' }
        ]
      },
      plugins: [
        new SPMWebpackPlugin(opts.cwd)
        //new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
        //new webpack.ContextReplacementPlugin(/moment[\\\/]lang$/, /^\.\/(zh-cn)$/)
        //new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/)
      ]
    };

    if (opts.extractCSS) {
      args.plugins.push(new ExtractTextPlugin('[name].css', {
        disable: false,
        allChunks: true
      }));
    }

    if (opts.entry) {
      args.entry = getFiles(cwd, {output:opts.entry});
    } else {
      args.entry = getFiles(cwd, pkg.spm);
    }

    if (opts.umd) {
      args.output.library = opts.umd;
      args.output.libraryTarget = 'umd';
    }

    if (!opts.debug) {
      args.plugins.push(new webpack.optimize.UglifyJsPlugin(opts.uglify));
    }

    args.externals = opts.global;

    require('./logArgs')(args);

    webpack(args, function(err, stats) {
      if (err) log.error('error', err);
      console.log();
      console.log(stats.toString());
      console.log();
      callback(err);
    });

  });

};
