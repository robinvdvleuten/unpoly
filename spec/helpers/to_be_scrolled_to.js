/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toBeScrolledTo(util, customEqualityTesters) {
      return {
        compare(object, expectedTop) {
          const tolerance = 1.5;
          const actualTop = $(object).scrollTop();
          return {
            pass:
              Math.abs(expectedTop - actualTop) <= tolerance
          };
        }
      };
    }
  }));
})();
