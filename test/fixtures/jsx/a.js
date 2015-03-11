/** @jsx React.DOM */

var Foo = require('./Foo');

var Test = React.createClass({
  render: function() {
    return <div><Foo /></div>;
  }
});
