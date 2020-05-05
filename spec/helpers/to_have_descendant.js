/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveDescendant(util, customEqualityTesters) {
      return {
        compare(element, expectedDescendant) {
          return {pass: $(element).find(expectedDescendant).length};
        }
      };
    }
  }));
})();
