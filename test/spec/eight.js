// load the entire module and pass to the test
define(['eight'],function(eight) {

  // use jasmine to run tests against the required code
  describe('eight', function() {

    it('should be accessible', function() {
      expect(eight).toNotBe(null);
    });

    it('should return a VERSION', function() {
      expect(eight.VERSION).toNotBe(null);
    });

  });

});
