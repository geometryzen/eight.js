define(['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  var Geometry = function()
  {
    this.vertices = [];
    this.colors = [];
    this.vertexIndices = [];
  };

  Geometry.prototype.primitives = function(gl)
  {
    return gl.TRIANGLES;
  };

  return Geometry;
});