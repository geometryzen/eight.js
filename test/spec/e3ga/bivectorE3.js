define(['eight'],function(eight)
{
  describe('bivectorE3', function()
  {
    it('components', function()
    {
      var xy = Math.random();
      var yz = Math.random();
      var zx = Math.random();
      var mv = eight.bivectorE3(xy, yz, zx);
      expect(mv.w).toBe(0);
      expect(mv.x).toBe(0);
      expect(mv.y).toBe(0);
      expect(mv.z).toBe(0);
      expect(mv.xy).toBe(xy);
      expect(mv.yz).toBe(yz);
      expect(mv.zx).toBe(zx);
      expect(mv.xyz).toBe(0);
    });
  });
});
