define(function()
{
  var constructor = function(canvas, contextLoss, contextGain)
  {
    var webGLContextLost = function(event)
    {
      event.preventDefault();
      contextLoss();
    };

    var webGLContextRestored = function(event)
    {
      event.preventDefault();
      var gl = canvas.getContext("webgl");
      contextGain(gl);
    };

    var api =
    {
      start: function()
      {
        canvas.addEventListener('webglcontextlost', webGLContextLost, false);
        canvas.addEventListener('webglcontextrestored', webGLContextRestored, false);
      },
      stop: function()
      {
        canvas.removeEventListener('webglcontextrestored', webGLContextRestored, false);
        canvas.removeEventListener('webglcontextlost', webGLContextLost, false);
      }
    };

    return api;
  };

  return constructor;
});