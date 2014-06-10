define(['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  var Object3D = function()
  {
    this.transform = new Conformal3();
  };

  Object3D.prototype.onContextGain = function(gl)
  {
    console.error("Missing onContextGain function");
  }

  Object3D.prototype.onContextLoss = function()
  {
    console.error("Missing onContextLoss function");
  }

  Object3D.prototype.tearDown = function()
  {
    console.error("Missing tearDown function");
  }

  Object3D.prototype.move = function()
  {
    console.error("Missing move function");
  }

  Object3D.prototype.draw = function()
  {
    console.error("Missing draw function");
  }

  return Object3D;
});