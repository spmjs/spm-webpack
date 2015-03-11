'use strict';

var join = require('path').join;
var thunkify = require('thunkify');
var rimraf = require('rimraf');
var glob = require('glob');
var fs = require('fs');

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
      cwd: join(fixtures, 'js-entry'),
      dest: dest
    });
    assert(dest, 'js-entry');
  });

});

function assert(actual, expect) {
  expect = join(fixtures, '../expected', expect);
  glob.sync('**/*', {cwd: actual})
    .forEach(function(file) {
      var filepath = join(actual, file);
      if (fs.statSync(filepath).isFile()) {
        fs.readFileSync(filepath).toString()
          .should.eql(fs.readFileSync(join(expect, file)).toString());
      }
    });
}
