define(function() {

  var WebGLRenderer = function(context) {
    console.log("Hello, WebGLRenderer!");
    this.context = context;
  }

  WebGLRenderer.prototype.clearColor = function(r,g,b,a) {
    this.context.clearColor(r,g,b,a);
  };

  return WebGLRenderer;

});