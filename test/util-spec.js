'use strict';

var utils = require('../lib/utils');

describe('lib/utils.js', function() {

  it('normalizeLoader', function() {
    utils.normalizeLoader('a!b', {build:{loader:{'.js':'c'}}}, 'js').should.be.equal('c');
    utils.normalizeLoader('a!b', {build:{loader:{'.js':'+c'}}}, 'js').should.be.equal('c!a!b');
    utils.normalizeLoader('a!b', {build:{loader:{'.js':'-a'}}}, 'js').should.be.equal('b');
    utils.normalizeLoader('a!b', {build:{loader:{'.js':'-b'}}}, 'js').should.be.equal('a');
    utils.normalizeLoader('a!b', {build:{loader:{'.js':'+c$'}}}, 'js').should.be.equal('a!b!c');
    utils.normalizeLoader('a?abc!b', {build:{loader:{'.js':'+c'}}}, 'js').should.be.equal('c!a?abc!b');
    utils.normalizeLoader('a?abc!b', {build:{loader:{'.js':'-a'}}}, 'js').should.be.equal('b');
    utils.normalizeLoader('a?abc!b', {build:{loader:{'.js':'-a!+c'}}}, 'js').should.be.equal('c!b');
  });
});
