define(function()
{
  var euclidean3 = function(w, x, y, z, xy, yz, zx, xyz)
  {
    var api =
    {
      w: w,
      x: x,
      y: y,
      z: z,
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
      norm: function()
      {
        return euclidean3(Math.sqrt(x*x+y*y+z*z), 0, 0, 0, 0, 0, 0, 0);
      },
      sub: function(mv)
      {
        return euclidean3(w-mv.w, x-mv.x, y-mv.y, z-mv.z, xy-mv.xy, yz-mv.yz, zx-mv.zx, xyz-mv.xyz);
      }
    };
    return api;
  };

  return euclidean3;
});