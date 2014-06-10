define(['eight/cameras/camera'], function(camera)
{
  var constructor = function(fov, aspect, near, far)
  {
    var api = camera({});

    api.fov = fov !== undefined ? fov : 50;
    api.aspect = aspect !== undefined ? aspect : 1;
    api.near = near !== undefined ? near : 0.1;
    api.far = far !== undefined ? far : 2000;

    mat4.perspective(api.projectionMatrix, api.fov, api.aspect, api.near, api.far);

    return api;
  };

  return constructor;
});