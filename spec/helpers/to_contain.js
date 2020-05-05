/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toContain(util, customEqualityTesters) {
      return {
        compare(object, expectedElement) {
          return {pass: up.util.isGiven(object) && up.util.contains(object, expectedElement)};
        }
      };
    }
  }));
})();
