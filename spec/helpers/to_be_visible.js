/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toBeVisible(util, customEqualityTesters) {
      return {
        compare(object) {
          return {pass: object && up.specUtil.isVisible(object)};
        }
      };
    }
  }));
})();
