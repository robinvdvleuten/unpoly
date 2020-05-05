/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveText(util, customEqualityTesters) {
      return {
        compare(element, expectedText) {
          element = up.element.get(element);
          return {pass: element && ((element.textContent != null ? element.textContent.trim() : undefined) === expectedText.trim())};
        }
      };
    }
  }));
})();
