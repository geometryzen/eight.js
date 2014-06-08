// load the entire module/library and pass to the test
define(['eight'],function(eight) {

  // use jasmine to run tests against the required code
  describe('module', function() {

    it('should have a method', function() {
      expect(eight.module.method).toNotBe(undefined);
    });

    it('the method should work', function() {
      expect(eight.module.method()).toBe('it does');
    });

  });

});
