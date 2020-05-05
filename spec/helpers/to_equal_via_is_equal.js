/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addCustomEqualityTester(function(first, second) {
    if (u.isObject(first) && u.isObject(second) && first[up.util.isEqual.key]) {
      return first[u.isEqual.key](second);
    }
  }));
})();
