'use strict';

require('colorful').colorful();

var join = require('path').join;
var exists = require('fs').existsSync;
var readFile = require('fs').readFileSync;
var rimraf = require('rimraf');
var log = require('spm-log');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
var qs = require('qs');

var SPMWebpackPlugin = require('./SPMWebpackPlugin');
var FixCSSPathPlugin = require('./FixCSSPathPlugin');
var SPMPlugins = require('./SPMPlugins');
var getFiles = require('./getFiles');
var getArgs = require('./getArgs');

var co = require('co');
var install = co(require('spm-client/lib/install'));

var utils = require('./utils');
var normalize = utils.normalizeLoader;

module.exports = function build(opts, callback) {
  installDeps(opts, function() {
    // get opts
    var webpackOpts = getWebpackOpts(opts);

    // update webpack config by function
    if (opts.updateWebpackConfig) {
      webpackOpts = opts.updateWebpackConfig(webpackOpts, opts);
    }

    // build
    var compiler = webpack(webpackOpts);
    compiler.plugin('done', function() {
      callback();
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

Object.defineProperty(module.exports, 'installDeps', {
  get: function() {
    return installDeps;
  }
});

function installDeps(opts, callback) {
  var cwd = opts.cwd = opts.cwd || process.cwd();

  log.config({quiet: opts.quiet, verbose: opts.verbose});

  // Get pkg.
  var pkg = opts.pkg;
  if (!pkg && exists(join(cwd, 'package.json'))) {
    pkg = opts.pkg = JSON.parse(readFile(join(cwd, 'package.json'), 'utf-8'));
  }

  // Get deps to install.
  var query = [];
  if (!opts.noInstall && pkg && pkg.spm && pkg.spm.dependencies) {
    for (var k in pkg.spm.dependencies) {
      query.push(k+'@'+pkg.spm.dependencies[k]);
    }
  }

  install({
    name: query,
    cwd: cwd,
    registry: pkg && pkg.spm && pkg.spm.registry
  }, function(err) {
    if (err) {
      log.error('exit', err.message);
      console.log();
      process.exit(1);
    }
    callback();
  });
}

function getWebpackOpts(opts, callback) {
  var isProgress = opts.progress;
  var isWatch = opts.watch || opts.fromServer;
  var cwd = opts.cwd = opts.cwd || process.cwd();

  log.config({quiet: opts.quiet, verbose: opts.verbose});

  // Get pkg.
  var pkg = opts.pkg;
  if (!pkg && exists(join(cwd, 'package.json'))) {
    pkg = opts.pkg = JSON.parse(readFile(join(cwd, 'package.json'), 'utf-8'));
  }

  opts = getArgs(opts, pkg);

  // html minify - get arg from spm.build.htmlMinify or spm.htmlMinify
  var isHTMLMinified = !opts.build.debug && (opts.build.htmlMinify || (opts.build.pkg && opts.build.pkg.spm && opts.build.pkg.spm.htmlMinify));

  var files;
  if (opts.build.entry) {
    files = getFiles(cwd, {spm:{output:opts.build.entry}}, opts.build.pathmap);
  } else {
    files = getFiles(cwd, pkg, opts.build.pathmap);
  }

  var css = '';
  var spmcss = 'css';
  if (!opts.build.debug) spmcss = spmcss + '?minimize';
  if (opts.build.autoprefixer) css = css + '!autoprefixer';
  css = normalize(css, opts, 'css');
  if (css.charAt(0) !== '!') css = '!' + css;
  css = spmcss + css;
  var cssLoader = 'style!' + css;
  var lessLoader = 'style!' + normalize(css+'!less', opts, 'less');
  if (opts.build.extractCSS || files.extractCSS) {
    cssLoader = ExtractTextPlugin.extract('style', css);
    lessLoader = ExtractTextPlugin.extract('style', normalize(css+'!less', opts, 'less'));
  }

  var babelOpts = decodeURI(qs.stringify(opts.build.babel, {arrayFormat:'brackets'}));
  if (babelOpts) babelOpts = '?' + babelOpts;
  var babel = opts.build.babel ? ('babel'+babelOpts+'!') : '';
  var name = opts.build.hash ? '[name]-[chunkhash]' : '[name]';

  var loader = 'file';
  if (opts.build.base64) {
    var urlOpts = decodeURI(qs.stringify(opts.build.base64, {arrayFormat: 'brackets'}));
    loader = 'url';
    if (urlOpts) {
      loader = loader + '?' + urlOpts;
    }
  }

  var args = {
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    resolveLoader: {
      root: join(__dirname, '../node_modules'),
      modulesDirectories: [join(cwd, 'node_modules')]
    },
    output: {
      path: join(opts.build.dest || 'dist', utils.getPrefix(pkg)),
      filename: name + '.js',
      chunkFilename: name + '.js'
    },
    module: {
      loaders: [
        { test: /\.json$/, loader: normalize(babel + 'json', opts, 'json') },
        { test: /\.js$/, exclude: /spm_modules/, loader: normalize(babel + 'jsx2?harmony', opts, 'js') },
        { test: /\.coffee$/, exclude: /spm_modules/, loader: normalize('jsx2?harmony!coffee', opts, 'coffee') },
        { test: /\.jsx$/, exclude: /spm_modules/, loader: normalize('jsx2?harmony', opts, 'jsx') },
        { test: /\.tpl$/, loader: normalize('spmtpl', opts, 'tpl') },
        { test: /\.atpl$/, loader: normalize('atpl', opts, 'atpl') },
        { test: /\.handlebars$/, loader: normalize('handlebars?helperDirs[]=' + __dirname + '/../helpers', opts, 'handlebars') },
        { test: /\.css$/, loader: cssLoader },
        { test: /\.less$/, loader: lessLoader },
        { test: /\.(png|jpe?g|gif|eot|svg|ttf|woff|woff2)$/, loader: loader }
      ]
    },
    plugins: [
      new SPMWebpackPlugin(cwd),
      new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
      new FixCSSPathPlugin(opts.build.debug)
    ]
  };

  if (opts.build.extractCSS || files.extractCSS) {
    args.plugins.push(new ExtractTextPlugin(name + '.css', {
      disable: false,
      allChunks: true
    }));
  }

  if(opts.build.define){

    var pkgDefine = {};
    
    if(opts.build.define.indexOf(':') === -1){

      pkgDefine = opts.build.pkg.spm.define && opts.build.pkg.spm.define[opts.build.define] || {};

      for(var i in pkgDefine){
        pkgDefine[i] = parseDefineValue(pkgDefine[i]);
      }

    }else {

      opts.build.define && opts.build.define.split(',').forEach(function(pairs){
        var ele = pairs.split(':');
        ele[1] !== undefined && (pkgDefine[ele[0]] = parseDefineValue(ele[1]));
      });

    }
    args.plugins.push(new webpack.DefinePlugin(pkgDefine));
  }

  args.files = files;
  args.entry = files.js;

  if (opts.build.sourcemap) {
    args.devtool = '#source-map';
    opts.build.debug || (opts.build.uglify.sourceMap = true);
  }

  if (opts.build.umd) {
    args.output.library = opts.build.umd;
    args.output.libraryTarget = 'umd';
  }

  if (opts.build.library) {
    args.output.library = opts.build.library;
  }
  if (opts.build.libraryTarget) {
    args.output.libraryTarget = opts.build.libraryTarget;
  }

  if (opts.build.vendor) {
    args.entry.vendor = opts.build.vendor;
    args.plugins.push(new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'));
  }

  if (opts.build.common) {
    args.plugins.push(new webpack.optimize.CommonsChunkPlugin('common.js'));
  }

  if (!opts.build.debug) {
    args.plugins.push(new webpack.optimize.UglifyJsPlugin(opts.build.uglify));
  }

  args.plugins.push(new webpack.optimize.OccurenceOrderPlugin());

  if (isProgress) {
    args.plugins.push(new ProgressPlugin(function (percentage, msg) {
      if (msg === 'compile') return;
      var stream = process.stderr;
      if (stream.isTTY && percentage < 0.71) {
        stream.cursorTo(0);
        stream.write('       progress: ' + msg);
        stream.clearLine(1);
      } else if (percentage === 1) {
        console.log('');
      }
    }));
  }

  args.plugins.push(new SPMPlugins({
    files: files.other,
    outputPath: args.output.path,
    cwd: cwd,
    watch: isWatch,
    htmlMinify: isHTMLMinified
  }));

  args.externals = opts.build.global;

  args.amd = {
    hammerjs: true
  };

  require('./logArgs')(args);
  require('./logArgs')(opts);

  // clean first
  if (opts.build.clean) {
    rimraf.sync(opts.build.dest || 'dist');
    log.info('clean', opts.build.dest || 'dist');
  }

  args.pkg = pkg;

  if (callback) return callback(null, args);
  else return args;
}

function parseDefineValue(param){
  if(typeof(param) === 'string'){

    if(param === 'true') return true;
    else if(param === 'false') return false;
    else return isNaN(param) ? JSON.stringify(param) : param - 0;

  }else {
    return param;
  }
}
