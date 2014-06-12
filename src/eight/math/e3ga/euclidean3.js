define(function()
{
  var euclidean3 = function(w, x, y, z, xy, yz, zx, xyz)
  {
    w = w || 0;
    x = x || 0;
    y = y || 0;
    z = z || 0;
    xy = xy || 0;
    yz = yz || 0;
    zx = zx || 0;
    xyz = xyz || 0;

    var that =
    {
      xy: xy,
      yz: yz,
      zx: zx,
      xyz: xyz,
      cross: function(mv)
      {
        return euclidean3(0, y*mv.z-z*mv.y, z*mv.x-x*mv.z, x*mv.y-y*mv.x, 0, 0, 0, 0);
      },
      div: function(mv)
      {
        return euclidean3(w/mv.w, x/mv.w, y/mv.w, z/mv.w, 0, 0, 0, 0);
      },
      mul: function(mv)
      {
        return euclidean3(w*mv.w, x*mv.w, y*mv.w, z*mv.w, xy*mv.w, yz*mv.w, zx*mv.w, xyz*mv.w);
      },
      norm: function()
      {
        return euclidean3(Math.sqrt(x*x+y*y+z*z), 0, 0, 0, 0, 0, 0, 0);
      },
      quad: function()
      {
        return euclidean3(x*x+y*y+z*z, 0, 0, 0, 0, 0, 0, 0);
      },
      sub: function(mv)
      {
        return euclidean3(w-mv.w, x-mv.x, y-mv.y, z-mv.z, xy-mv.xy, yz-mv.yz, zx-mv.zx, xyz-mv.xyz);
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

  return euclidean3;
});