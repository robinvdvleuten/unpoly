/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveClass(util, customEqualityTesters) {
      return {
        compare(element, expectedClass) {
          element = up.element.get(element);
          return {pass: element && element.classList.contains(expectedClass)};
        }
      };
    }
  }));
})();
