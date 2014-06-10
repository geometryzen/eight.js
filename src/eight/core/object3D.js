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
      transform: new Conformal3(),
      onContextGain: function(gl)
      {
        console.error("Missing onContextGain function");
      },
      onContextLoss: function()
      {
        console.error("Missing onContextLoss function");
      },
      tearDown: function()
      {
        console.error("Missing tearDown function");
      },
      move: function()
      {
        console.error("Missing tearDown function");
      },
      draw: function(projectionMatrix)
      {
        console.error("Missing tearDown function");
      }
    };

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});