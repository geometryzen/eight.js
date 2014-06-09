define(function() {

  var WebGLContextMonitor = function(canvas, contextLoss, contextGain)
  {
    this.canvas = canvas;
    var self = this;

    this.webGLContextLost = function(event)
    {
      event.preventDefault();
      contextLoss();
    };

    this.webGLContextRestored = function(event)
    {
      event.preventDefault();
      self.gl = self.canvas.getContext("webgl");
      contextGain(self.gl);
    };
  };

  WebGLContextMonitor.prototype.start = function()
  {
    this.canvas.addEventListener('webglcontextlost', this.webGLContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.webGLContextRestored, false);
  };

  WebGLContextMonitor.prototype.stop = function()
  {
    this.canvas.removeEventListener('webglcontextrestored', this.webGLContextRestored, false);
    this.canvas.removeEventListener('webglcontextlost', this.webGLContextLost, false);
  };

  return WebGLContextMonitor;

});