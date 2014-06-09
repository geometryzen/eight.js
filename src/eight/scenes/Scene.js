define(function() {

  var Scene = function() {
    this.children = [];
  };

  Scene.prototype.add = function(mesh) {
    this.children.push(mesh);
  }

  Scene.prototype.tearDown = function() {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].tearDown();
    }
  }

  return Scene;

});