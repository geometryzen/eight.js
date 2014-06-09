define(function() {

  var Scene = function() {
    this.children = [];
  };

  Scene.prototype.add = function(mesh) {
    this.children.push(mesh);
  }

  Scene.prototype.onContextGain = function(gl) {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].onContextGain(gl);
    }
  }

  Scene.prototype.onContextLoss = function() {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].onContextLoss();
    }
  }

  Scene.prototype.tearDown = function() {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].tearDown();
    }
  }

  return Scene;

});