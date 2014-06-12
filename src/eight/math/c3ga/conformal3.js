define(function()
{
  var conformal3 = function(spec, my)
  {
    var w = spec ? (typeof spec.w !== 'undefined' ? spec.w : 0) : 0;
    var x = spec ? (typeof spec.x !== 'undefined' ? spec.x : 0) : 0;
    var y = spec ? (typeof spec.y !== 'undefined' ? spec.y : 0) : 0;
    var z = spec ? (typeof spec.z !== 'undefined' ? spec.z : 0) : 0;

    var that =
    {
      norm: function()
      {
        return conformal3(Math.sqrt(x*x+y*y+z*z), 0, 0, 0, 0, 0, 0, 0);
      },
      quad: function()
      {
        return conformal3(x*x+y*y+z*z, 0, 0, 0, 0, 0, 0, 0);
      }
    };

    Object.defineProperty(that, 'w', {
      get: function() {return w;},
      set: function(value) {w = value;}
    });
    // FIXME: The following are non-standard legacy and should not be used in production.
    that.__defineGetter__('x', function() {return x;});
    that.__defineSetter__('x', function(value) {x = value;});
    that.__defineGetter__('y', function() {return y;});
    that.__defineSetter__('y', function(value) {y = value;});
    that.__defineGetter__('z', function() {return z;});
    that.__defineSetter__('z', function(value) {z = value;});

    return that;
  };

  return conformal3;
});