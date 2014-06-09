define(['eight/cameras/Camera'], function(Camera) {

  var PerspectiveCamera = function(fov, aspect, near, far) {

    Camera.call(this);

    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;

    mat4.perspective(this.pMatrix, this.fov, this.aspect, this.near, this.far);

//  this.updateProjectionMatrix();

  };

  PerspectiveCamera.prototype = Object.create(Camera.prototype);

  return PerspectiveCamera;

});