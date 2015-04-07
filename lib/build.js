'use strict';

require('colorful').colorful();

var join = require('path').join;
var copy = require('fs-extra').copySync;
var exists = require('fs').existsSync;
var readFile = require('fs').readFileSync;
var rimraf = require('rimraf');
var log = require('spm-log');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var qs = require('qs');

var SPMWebpackPlugin = require('./SPMWebpackPlugin');
var FixCSSPathPlugin = require('./FixCSSPathPlugin');
var getFiles = require('./getFiles');
var getArgs = require('./getArgs');

var co = require('co');
var install = co(require('spm-client/lib/install'));

var utils = require('./utils');

module.exports = function build(opts, callback) {
  getWebpackOpts(opts, function(err, webpackOpts) {
    // build
    var compiler = webpack(webpackOpts);
    compiler.plugin('compile', function() {
      log.info('build', 'compile');
    });
    compiler.plugin('done', function(stats) {
      printResult(stats, opts);
      log.info('build', 'done');
      if (webpackOpts.files.other.length) copyFiles(webpackOpts.files.other, webpackOpts.output.path, webpackOpts.pkg, opts.cwd);

      if (callback) {
        callback(null, stats);
      }
    });

    if (opts.watch) {
      compiler.watch(200, function(err) {
        if (err) log.error('error', err);
      });
    } else {
      compiler.run(function(err) {
        if (err) log.error('error', err);
      });
    }
  });
};

Object.defineProperty(module.exports, 'getWebpackOpts', {
  get: function() {
    return getWebpackOpts;
  }
});

function getWebpackOpts(opts, callback) {
  var cwd = opts.cwd || process.cwd();

  log.config({quiet: opts.quiet, verbose: opts.verbose});

  // Get pkg.
  var pkg = opts.pkg;
  if (!pkg && exists(join(cwd, 'package.json'))) {
    pkg = JSON.parse(readFile(join(cwd, 'package.json'), 'utf-8'));
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

    var css = 'spmcss';
    if (!opts.debug) css = css + '?minimize';
    if (opts.autoprefixer) css = css + '!autoprefixer';
    var cssLoader = 'style!' + css;
    var lessLoader = 'style!'+css+'!less';
    if (opts.extractCSS) {
      cssLoader = ExtractTextPlugin.extract('style', css);
      lessLoader = ExtractTextPlugin.extract('style', css+'!less');
    }

    var babelOpts = decodeURI(qs.stringify(opts.babel, {arrayFormat:'brackets'}));
    if (babelOpts) babelOpts = '?' + babelOpts;
    var babel = opts.babel ? ('babel'+babelOpts+'!') : '';
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
          { test: /\.json$/, loader: babel + 'json' },
          { test: /\.js$/, loader: babel + 'jsx2?harmony' },
          { test: /\.coffee$/, loader: 'jsx2?harmony!coffee' },
          { test: /\.jsx2$/, loader: 'jsx2?harmony' },
          { test: /\.tpl$/, loader: 'html' },
          { test: /\.atpl$/, loader: 'atpl' },
          { test: /\.handlebars$/, loader: 'handlebars?helperDirs[]=' + __dirname + '/../helpers' },
          { test: /\.css$/, loader: cssLoader },
          { test: /\.less$/, loader: lessLoader },
          { test: /\.(png|jpe?g|gif|eot|svg|ttf|woff)$/, loader: 'file' }
        ]
      },
      plugins: [
        new SPMWebpackPlugin(opts.cwd),
        new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
        new FixCSSPathPlugin()
      ]
    };

    if (opts.extractCSS) {
      args.plugins.push(new ExtractTextPlugin(name + '.css', {
        disable: false,
        allChunks: true
      }));
    }

    if (opts.define && typeof opts.define === 'object') {
      args.plugins.push(new webpack.DefinePlugin(opts.define));
    }

    var files;
    if (opts.entry) {
      files = getFiles(cwd, {spm:{output:opts.entry}});
    } else {
      files = getFiles(cwd, pkg);
    }
    args.files = files;
    args.entry = files.js;

    if (opts.umd) {
      args.output.library = opts.umd;
      args.output.libraryTarget = 'umd';
    }

    if (opts.vendor) {
      args.entry.vendor = opts.vendor;
      args.plugins.push(new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'));
    }

    if (opts.common) {
      args.plugins.push(new webpack.optimize.CommonsChunkPlugin('common.js'));
    }

    if (!opts.debug) {
      args.plugins.push(new webpack.optimize.UglifyJsPlugin(opts.uglify));
    }

    args.externals = opts.global;

    require('./logArgs')(args);

    // clean first
    if (opts.clean) {
      rimraf.sync(args.output.path);
      log.info('clean', args.output.path);
    }

    args.pkg = pkg;

    callback(null, args);
  });
}

function printResult(stats) {
  log.debug('stats', '\n' + stats.toString());

  stats = stats.toJson();

  (stats.errors || []).forEach(function(err) {
    log.error('error', err);
  });

  stats.assets.forEach(function(item) {
    var size = (item.size/1024.0).toFixed(2) + 'kB';
    log.info('generated', item.name, size.to.magenta.color);
  });
}

function copyFiles(files, destDir, pkg, cwd) {
  files.forEach(function(file) {
    var destFile = join(destDir, utils.getPrefix(pkg), file);
    var err = copy(join(cwd, file), destFile);
    if (err) {
      log.error('copy', err);
    } else {
      log.info('copy', utils.getPrefix(pkg) + file);
    }
  });
}
