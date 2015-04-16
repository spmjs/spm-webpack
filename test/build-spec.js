'use strict';

var join = require('path').join;
var thunkify = require('thunkify');
var rimraf = require('rimraf');
var glob = require('glob');
var fs = require('fs-extra');

var fixtures = join(__dirname, 'fixtures');
var dest = join(fixtures, 'tmp');
var build = thunkify(function(opts, done) {
  require('../lib/build')(opts, done);
});

describe('lib/build.js', function() {

  afterEach(function(done) {
    rimraf(dest, done);
  });

  it('js entry', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'js-entry'),
      dest: dest
    });
    assert(dest, 'js-entry');
  });

  it('js entry umd', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'js-entry'),
      dest: dest,
      umd: 'Foo'
    });
    assert(dest, 'js-entry-umd');
  });

  it('js entry with no package.json', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'js-entry-no-pkg'),
      dest: dest,
      entry: ['a.js']
    });
    assert(dest, 'js-entry-no-pkg');
  });

  it('clean', function*() {
    fs.mkdirpSync(dest);
    fs.writeFileSync(join(dest, 'clean.js'), 'abc', 'utf-8');
    yield build({
      debug: true,
      cwd: join(fixtures, 'copy'),
      dest: dest,
      clean: true
    });
    assert(dest, 'copy');
  });

  it('babel', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'babel'),
      dest: dest
    });
    assert(dest, 'babel');
  });

  it('handlebars', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'handlebars'),
      dest: dest
    });
    assert(dest, 'handlebars');
  });

  it('global', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'global'),
      dest: dest
    });
    assert(dest, 'global');
  });

  it('dynamic', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'dynamic'),
      dest: dest
    });
    assert(dest, 'dynamic');
  });

  it('idleading', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'idleading'),
      dest: dest
    });
    assert(dest, 'idleading');
  });

  it('copy', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'copy'),
      dest: dest
    });
    assert(dest, 'copy');
  });

  xit('hash', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'hash'),
      dest: dest
    });
    assert(dest, 'hash');
  });

  it('vendor', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'js-entry'),
      dest: dest,
      vendor: ['a']
    });
    assert(dest, 'js-entry-vendor');
  });

  it('common', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'common'),
      dest: dest
    });
    assert(dest, 'common');
  });

  it('umd', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'umd'),
      dest: dest
    });
    assert(dest, 'umd');
  });

  xit('require css', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'require-css'),
      dest: dest
    });
    assert(dest, 'require-css');
  });

  it('require css extract', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'require-css'),
      dest: dest,
      extractCSS: true
    });
    assert(dest, 'require-css-extract');
  });

  it('min (compress)', function*() {
    yield build({
      cwd: join(fixtures, 'require-css'),
      dest: dest,
      extractCSS: true
    });
    assert(dest, 'require-css-min');
  });

  it('require css autoprefixer', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'require-css-autoprefixer'),
      dest: dest
    });
    assert(dest, 'require-css-autoprefixer');
  });

  it('require less extract', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'require-less'),
      dest: dest,
      extractCSS: true
    });
    assert(dest, 'require-less-extract');
  });

  it('jsx', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'jsx'),
      dest: dest
    });
    assert(dest, 'jsx');
  });

  it('keep-filepath', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'keep-filepath'),
      dest: dest
    });
    assert(dest, 'keep-filepath');
  });

  it('fix-css-resources-path', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'fix-css-resources-path'),
      dest: dest
    });
    assert(dest, 'fix-css-resources-path');
  });

  it('define', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'define'),
      dest: dest
    });
    assert(dest, 'define');
  });

  it('base64', function*() {
    yield build({
      debug: true,
      cwd: join(fixtures, 'base64'),
      dest: dest
    });
    assert(dest, 'base64');
  });

  describe('custom-loader', function() {

    var oldCwd;

    before(function() {
      oldCwd = process.cwd();
      process.chdir(join(fixtures, 'custom-loader'));
    });

    after(function() {
      process.chdir(oldCwd);
    });

    it('custom-loader', function*() {
      yield build({
        debug: true,
        cwd: join(fixtures, 'custom-loader'),
        dest: dest
      });
      assert(dest, 'custom-loader');
    });

  });

  describe('scripts', function() {

    afterEach(function() {
      rimraf.sync(join(fixtures, 'scripts/index.js'));
    });

    it('with scripts', function* () {
      process.chdir(join(fixtures, 'scripts'));
      yield require('exeq')('node --harmony ' + join(__dirname, '../cli.js'));
      fs.readFileSync(join(fixtures, 'scripts', 'index.js'), 'utf-8').should.be.equal('1\n2\n3\n');
    });

  });

});

function assert(actual, expect) {
  expect = join(fixtures, '../expected', expect);
  glob.sync('**/*', {cwd: actual})
    .forEach(function(file) {
      var filepath = join(actual, file);
      if (fs.statSync(filepath).isFile()) {
        var c = fs.readFileSync(filepath).toString();
        var ec = fs.readFileSync(join(expect, file)).toString();
        c.should.eql(ec);
      }
    });
}
