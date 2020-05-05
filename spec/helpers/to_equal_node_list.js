/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addCustomEqualityTester(function(a, b) {
    if (a instanceof NodeList) {
      return (a.length === b.length) && u.every(a, (elem, index) => a[index] === b[index]);
    }
  }));
})();
