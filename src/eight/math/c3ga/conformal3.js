define(function()
{
  var euclidean3 = function(w, x, y, z)
  {
    w = w || 0;
    x = x || 0;
    y = y || 0;
    z = z || 0;

    var api =
    {
      w: w,
      x: x,
      y: y,
      z: z
    };
    return api;
  };

  return euclidean3;
});