define(function()
{
  var conformal3 = function(w, x, y, z)
  {
    w = w || 0;
    x = x || 0;
    y = y || 0;
    z = z || 0;

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
    that.__defineGetter__('w', function() {return w;});
    that.__defineSetter__('w', function(value) {w = value;});
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