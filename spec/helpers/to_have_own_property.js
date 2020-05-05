/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveOwnProperty(util, customEqualityTesters) {
      return {
        compare(object, expectedProperty) {
          return {pass: object.hasOwnProperty(expectedProperty)};
        }
      };
    }
  }));
})();
