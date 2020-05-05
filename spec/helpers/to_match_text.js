/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toMatchText(util, customEqualityTesters) {
      return {
        compare(actualString, expectedString) {
          const normalize = function(str) {
            str = str.trim();
            str = str.replace(/[\n\r\t ]+/g, ' ');
            return str;
          };

          return {pass: normalize(actualString) === normalize(expectedString)};
        }
      };
    }
  }));
})();