define(['eight/core/Object3D'], function(Object3D) {

  var Camera = function()
  {
    Object3D.call(this);
    this.projectionMatrix = mat4.create();
  };

  Camera.prototype = Object.create(Object3D.prototype);

  return Camera;

});