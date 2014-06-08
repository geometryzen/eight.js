// load the entire module/library and pass to the test
define(['eight'],function(eight) {

  // use jasmine to run tests against the required code
  describe('coffeescript', function() {

    it('should be automatically transpiled', function() {
      expect(eight.coffeescript()).toBe('working');
    });

  });

});
