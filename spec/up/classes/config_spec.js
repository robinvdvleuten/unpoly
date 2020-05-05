/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  describe('up.Config', function() {

    describe('constructor', () => it('creates an object with the given attributes', function() {
      const object = new up.Config({a: 1, b: 2});
      expect(object.a).toBe(1);
      return expect(object.b).toBe(2);
    }));

    return describe('#reset', function() {

      it('resets the object to its original state', function() {
        const object = new up.Config({a: 1});
        expect(object.b).toBeUndefined();
        object.a = 2;
        expect(object.a).toBe(2);
        object.reset();
        return expect(object.a).toBe(1);
      });

      return it('does not remove the #reset or #update method from the object', function() {
        const object = new up.Config({a: 1});
        object.b = 2;
        object.reset();
        return expect(object.reset).toBeDefined();
      });
    });
  });
})();