#!/usr/bin/env node

'use strict';

require('colorful').colorful();

var program = require('commander');
var log = require('spm-log');
var join = require('path').join;
var exists = require('fs').existsSync;
var readFile = require('fs').readFileSync;

program
  .version(require('./package').version, '-v, --version')
  .option('-I, --input-directory <dir>', 'input directory, default: current working directory')
  .option('-O, --output-directory <dir>', 'output directory, default: dist')
  //.option('-f, --force', 'force install dependencies from registry')
  .option('-c, --clean', 'clean dest directory first')
  .option('-w, --watch', 'watch mode')
  //.option('-r, --registry <url>', 'registry url of repository server')
  .option('--umd [umd]', 'UMD-wrapped version with given global name')
  .option('--global <global>', 'replace package name to global variable, format jquery:$,underscore:_')
  .option('--debug', 'build files without compress')
  .option('--verbose', 'show more logging')
  .option('--progress', 'show progress')
  .option('--no-color', 'disable colorful print')
  //.option('--no-install', 'disable install')
  .option('--sourcemap', 'enable sourcemap for build')
  .option('--define [yourMode]', 'using the value of pkg.spm.define.yourMode or pkg.spm.define.default when "yourMode" is not specified')
  .parse(process.argv);

log.config(program);

var cwd = join(process.cwd(), program.inputDirectory || '');
var file = join(cwd, 'package.json');
try {
  var pkg = exists(file) && JSON.parse(readFile(file, 'utf-8')) || {};
} catch(e) {
  log.error('error', 'package.json parse error');
  console.log(e.stack);
  process.exit(1);
}
var entry = program.args;

var info = '';
if (entry.length) {
  info = 'build ' + entry.join(',');
} else {
  var pkgId = pkg.name && pkg.version && (pkg.name + '@' + pkg.version) || '';
  info = ('build ' + pkgId).to.magenta.color;
}

var begin = Date.now();
console.log();
log.info('start', info);

var args = {
  cwd: cwd,
  pkg: pkg,
  dest: program.outputDirectory,

  umd: program.umd,
  global: program.global,
  registry: program.registry || (pkg.spm && pkg.spm.registry),

  force: program.force,
  clean: program.clean,
  watch: program.watch,
  noInstall: !program.install,

  debug: program.debug,
  progress: program.progress,

  sourcemap: program.sourcemap,
  define: program.define
};

if (entry && entry.length) {
  args.entry = entry;
}

require('babel-core/register')({
  only: /scripts-hook\/_index/
});
var hook = require('scripts-hook');
var scripts = pkg && pkg.spm && pkg.spm.scripts || {};
hook(scripts, 'build', function(done) {
  var build = require('./lib/build');
  build(args, done);
}).then(function() {
  log.info('finish', info + showDiff(begin));
  console.log();
}, function(err) {
  console.error();
  console.error(err.stack);
});

function showDiff(time) {
  var diff = Date.now() - time;
  return (' (' + diff + 'ms)').to.gray.color;
}

require('atool-monitor').emit();
