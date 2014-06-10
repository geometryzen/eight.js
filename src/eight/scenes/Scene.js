define(['eight/core/Object3D'], function(Object3D)
{
  var Scene = function()
  {
    Object3D.call(this);
    this.children = [];
  };

  Scene.prototype = new Object3D();

  Scene.prototype.add = function(mesh)
  {
    this.children.push(mesh);
  };

  Scene.prototype.onContextGain = function(gl)
  {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++)
    {
      children[i].onContextGain(gl);
    }
  };

  Scene.prototype.onContextLoss = function()
  {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++)
    {
      children[i].onContextLoss();
    }
  };

  Scene.prototype.tearDown = function()
  {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++)
    {
      children[i].tearDown();
    }
  };

  return Scene;
});