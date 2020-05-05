/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toBeMissing(util, customEqualityTesters) {
      return {
        compare(actual) {
          return {pass: up.util.isMissing(actual)};
        }
      };
    }
  }));
})();