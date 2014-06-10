define(['eight/math/e3ga/Euclidean3'], function(Euclidean3)
{
  return function(x, y, z)
  {
    return new Euclidean3(0, x, y, z, 0, 0, 0, 0);
  };
});