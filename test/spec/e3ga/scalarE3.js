define(['eight'],function(eight)
{
  describe('scalarE3', function()
  {
    it('components', function()
    {
      var w = Math.random();
      var mv = eight.scalarE3(w);
      expect(mv.w).toBe(w);
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
