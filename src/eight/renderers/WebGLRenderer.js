define(function() {

  var WebGLRenderer = function(gl) {
    this.gl = gl;
    gl.clearColor(32/256, 32/256, 32/256, 1.0);
    gl.enable(gl.DEPTH_TEST);
  };

  WebGLRenderer.prototype.clearColor = function(r, g, b, a) {
    var gl = this.gl;
    gl.clearColor(r, g, b, a);
  };

  WebGLRenderer.prototype.render = function(scene, camera) {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  };

  WebGLRenderer.prototype.viewport = function(x, y, width, height) {
    var gl = this.gl;
    gl.viewport(x, y, width, height);
  };

  return WebGLRenderer;

});