define(['eight/cameras/camera'], function(camera)
{
  var constructor = function(fov, aspect, near, far)
  {
    var that;

    // Other private instance variables.

    // Add shared variables and functions to my.

    that = camera({});

    that.fov = fov !== undefined ? fov : 50;
    that.aspect = aspect !== undefined ? aspect : 1;
    that.near = near !== undefined ? near : 0.1;
    that.far = far !== undefined ? far : 2000;

    mat4.perspective(that.projectionMatrix, that.fov, that.aspect, that.near, that.far);

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});