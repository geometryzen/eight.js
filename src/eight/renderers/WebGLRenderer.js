define(function() {

  var WebGLRenderer = function()
  {
  };

  WebGLRenderer.prototype.onContextGain = function(gl)
  {
    this.gl = gl;
    gl.clearColor(32/256, 32/256, 32/256, 1.0);
    gl.enable(gl.DEPTH_TEST);
  };

  WebGLRenderer.prototype.onContextLoss = function()
  {
    delete this.gl;
  };

  WebGLRenderer.prototype.clearColor = function(r, g, b, a)
  {
    var gl = this.gl;
    gl.clearColor(r, g, b, a);
  };

  WebGLRenderer.prototype.render = function(scene, camera)
  {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var children = scene.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].move();
      children[i].draw(gl, camera.projectionMatrix);
    }
  };

  WebGLRenderer.prototype.viewport = function(x, y, width, height)
  {
    var gl = this.gl;
    gl.viewport(x, y, width, height);
  };

  return WebGLRenderer;

});