define(function() {

  var Scene = function() {
    this.children = [];
  };

  Scene.prototype.add = function(mesh) {
    this.children.push(mesh);
  }

  return Scene;

});