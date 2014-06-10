define(['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  var constructor = function(spec, my)
  {
    var that;

    // Other private instance variables.

    my = my || {};

    // Add shared variables and functions to my.

    that =
    {
      vertices: [],
      vertexIndices: [],
      colors: [],
      primitives: function(gl)
      {
        return gl.TRIANGLES;
      }
    };

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});