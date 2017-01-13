'use strict';

function log(x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'World';

  console.log(x, y);
}
log();

var f = function f(v) {
  return v;
};