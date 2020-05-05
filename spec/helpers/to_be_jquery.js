/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  beforeEach(() => jasmine.addMatchers({
    toBeJQuery(util, customEqualityTesters) {
      return {
        compare(actual) {
          return {pass: up.util.isJQuery(actual)};
        }
      };
    }
  }));
})();
