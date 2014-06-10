define(function()
{
  var constructor = function()
  {
    var gl;

    var that =
    {
      onContextGain: function(context)
      {
        gl = context;
        gl.clearColor(32/256, 32/256, 32/256, 1.0);
        gl.enable(gl.DEPTH_TEST);
      },
      onContextLoss: function()
      {
      },
      clearColor: function(r, g, b, a)
      {
        gl.clearColor(r, g, b, a);
      },
      render: function(scene, camera)
      {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var children = scene.children;
        for(var i = 0, length = children.length; i < length; i++)
        {
          children[i].move();
          children[i].draw(camera.projectionMatrix);
        }
      },
      viewport: function(x, y, width, height)
      {
        gl.viewport(x, y, width, height);
      }
    };

    return that;
  };

  return constructor;
});