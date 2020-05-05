/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.legacy', function() {

    describe('renamedModule()', () => it('prints a warning and forwards the call to the new module', function() {
      const warnSpy = spyOn(up, 'warn');
      const value = up.dom;
      expect(warnSpy).toHaveBeenCalled();
      return expect(value).toBe(up.fragment);
    }));

    return describe('warn()', function() {

      it('prepends a deprecation prefix to the given message and prints it to the warning log', function() {
        const spy = spyOn(up, 'warn');
        up.legacy.warn("a legacy warning");
        return expect(spy).toHaveBeenCalledWith('[DEPRECATION] a legacy warning');
      });

      it('only prints a given message once', function() {
        const spy = spyOn(up, 'warn');
        up.legacy.warn("a very unique legacy warning");
        up.legacy.warn("a very unique legacy warning");
        return expect(spy.calls.count()).toBe(1);
      });

      return it('allows substitution');
    });
  });
})();