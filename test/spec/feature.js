// load the entire module/library and pass to the test
define(['eight'],function(eight) {

  // use jasmine to run tests against the required code
  describe('feature', function() {

    it('should be working', function() {
      expect(eight.feature()).toBe('working');
    });

  });

});
