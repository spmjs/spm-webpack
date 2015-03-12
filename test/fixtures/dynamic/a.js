
console.log('a');

require(['./b'], function(b) {
  b('a');
});
