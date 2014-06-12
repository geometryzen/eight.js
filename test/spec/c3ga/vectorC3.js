define(['eight'],function(eight)
{
  describe('vectorC3', function()
  {
    xit('components', function()
    {
      var x = Math.random();
      var y = Math.random();
      var z = Math.random();
      var mv = eight.vectorC3(x, y, z);
      expect(mv.w).toBe(0);
      expect(mv.x).toBe(x);
      expect(mv.y).toBe(y);
      expect(mv.z).toBe(z);
    });
  });
});
