define(function() {

  var Euclidean3 = function(w, x, y, z, xy, yz, zx, xyz)
  {
    this.w   = w;
    this.x   = x;
    this.y   = y;
    this.z   = z;
    this.xy  = xy;
    this.yz  = yz;
    this.zx  = zx;
    this.xyz = xyz;
  };

  return Euclidean3;

});