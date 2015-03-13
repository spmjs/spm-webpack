'use strict';

var join = require('path').join;
var resolve = require('../lib/resolve');
var base = join(__dirname, 'fixtures/resolve');

describe('lib/resolve.js', function() {

  it('normal', function() {
    resolve(base + '/a/a').should.be.equal(base + '/a/a.js');
    resolve(base + '/a/a.js').should.be.equal(base + '/a/a.js');
    resolve(base + '/b/a').should.be.equal(base + '/b/a/index.js');
    resolve(base + '/b/a/index').should.be.equal(base + '/b/a/index.js');
    resolve(base + '/b/a/index.js').should.be.equal(base + '/b/a/index.js');
    resolve(base + '/c/a').should.be.equal(base + '/c/a.js');
    resolve(base + '/c/a.js').should.be.equal(base + '/c/a.js');
    resolve(base + '/c/a/').should.be.equal(base + '/c/a/index.js');
    resolve(base + '/c/a/index').should.be.equal(base + '/c/a/index.js');
    resolve(base + '/c/a/index.js').should.be.equal(base + '/c/a/index.js');
  });
});
