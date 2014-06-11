define(['eight'],function(eight)
{
  describe('euclidean3', function()
  {
    it('construction with no arguments gives zero', function()
    {
      var mv = eight.euclidean3();
      expect(mv.w).toBe(0);
      expect(mv.x).toBe(0);
      expect(mv.y).toBe(0);
      expect(mv.z).toBe(0);
      expect(mv.xy).toBe(0);
      expect(mv.yz).toBe(0);
      expect(mv.zx).toBe(0);
      expect(mv.xyz).toBe(0);
    });
  });
});
