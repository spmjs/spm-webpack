'use strict';

var join = require('path').join;
var basename = require('path').basename;
var copy = require('fs-extra').copySync;
var exists = require('fs').existsSync;
var rimraf = require('rimraf');
var log = require('spm-log');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var SPMWebpackPlugin = require('./SPMWebpackPlugin');
var getFiles = require('./getFiles');
var getArgs = require('./getArgs');

var co = require('co');
var install = co(require('spm-client/lib/install'));

module.exports = function build(opts, callback) {
  var cwd = opts.cwd || process.cwd();

  if (opts.quiet) {
    log.config({quiet: opts.quiet});
  }

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
    var name = opts.hash ? '[name]-[hash]' : '[name]';

    var args = {
      resolveLoader: {
        root: join(__dirname, '../node_modules')
      },
      output: {
        path: opts.dest || 'dist',
        filename: name + '.js',
        chunkFilename: name + '.js'
      },
      module: {
        loaders: [
          { test: /\.js$/, loader: babel + 'jsx' },
          { test: /\.jsx$/, loader: 'jsx' },
          { test: /\.tpl$/, loader: 'html' },
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

    if (pkg) {
      if (pkg.name)    args.output.path = args.output.path + '/' + pkg.name;
      if (pkg.version) args.output.path = args.output.path + '/' + pkg.version;
    }

    if (opts.extractCSS) {
      args.plugins.push(new ExtractTextPlugin(name + '.css', {
        disable: false,
        allChunks: true
      }));
    }

    var files;
    if (opts.entry) {
      files = getFiles(cwd, {output:opts.entry});
    } else {
      files = getFiles(cwd, pkg.spm);
    }

    args.entry = files.js;

    if (opts.umd) {
      args.output.library = opts.umd;
      args.output.libraryTarget = 'umd';
    }

    if (opts.vendor) {
      args.entry.vendor = opts.vendor;
      args.plugins.push(new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'));
    }

    if (!opts.debug) {
      args.plugins.push(new webpack.optimize.UglifyJsPlugin(opts.uglify));
    }

    args.externals = opts.global;

    require('./logArgs')(args);

    // clean first
    if (opts.force) {
      rimraf.sync(args.output.path);
      log.info('clean', args.output.path);
    }

    // build
    webpack(args, function(err, stats) {
      if (err) log.error('error', err);
      if (files.other.length) copyFiles(files.other, args.output.path);
      !opts.quiet && console.log('\n' + stats.toString() + '\n');
      callback(err, stats);
    });

  });
};

function copyFiles(files, destDir) {
  files.forEach(function(file) {
    var destFile = join(destDir, basename(file));
    var err = copy(file, destFile);
    if (err) {
      log.error('copy', err);
    } else {
      log.info('copy', file);
    }
  });
}
