/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  const endsWith = (string, substring) => string.indexOf(substring) === (string.length - substring.length);

  beforeEach(() => jasmine.addMatchers({
    toEndWith(util, customEqualityTesters) {
      return {
        compare(actual, expected) {
          return {pass: endsWith(actual, expected)};
        }
      };
    }
  }));
})();
