define(['eight'],function(eight)
{
  describe('vectorC3', function()
  {
    it('components', function()
    {
      var xo = Math.random();
      var x1 = Math.random();
      var x2 = Math.random();
      var x3 = Math.random();
      var xi = Math.random();
      var mv = eight.vectorC3(xo, x1, x2, x3, xi);
      expect(mv.w).toBe(0);
      expect(mv.xo).toBe(xo);
//      expect(mv.y).toBe(y);
//      expect(mv.z).toBe(z);
    });
  });
});
