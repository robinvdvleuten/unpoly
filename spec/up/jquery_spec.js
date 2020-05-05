/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  describe('window.$', () => it('should be undefined to not accidentally pass on jQuery-dependent code', () => expect(window.$).toBeUndefined()));
})();
