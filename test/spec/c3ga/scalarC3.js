define(['eight'],function(eight)
{
  describe('scalarC3', function()
  {
    it('w component should match argument', function()
    {
      var arg = Math.random();
      var mv = eight.scalarC3(arg);
      expect(mv.w).toBe(arg);
    });
    it('x component should be zero', function()
    {
      var arg = Math.random();
      var mv = eight.scalarC3(arg);
      expect(mv.x).toBe(0);
    });
    it('y component should be zero', function()
    {
      var arg = Math.random();
      var mv = eight.scalarC3(arg);
      expect(mv.y).toBe(0);
    });
    it('z component should be zero', function()
    {
      var arg = Math.random();
      var mv = eight.scalarC3(arg);
      expect(mv.z).toBe(0);
    });
  });
});
