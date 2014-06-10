define(['eight'],function(eight)
{
  describe('vectorE3', function()
  {
    it('components', function()
    {
      var x = Math.random();
      var y = Math.random();
      var z = Math.random();
      var v = eight.vectorE3(x, y, z);
      expect(v.w).toBe(0);
      expect(v.x).toBe(x);
      expect(v.y).toBe(y);
      expect(v.z).toBe(z);
      expect(v.xy).toBe(0);
      expect(v.yz).toBe(0);
      expect(v.zx).toBe(0);
      expect(v.xyz).toBe(0);
    });
  });
});
