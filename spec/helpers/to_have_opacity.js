/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toHaveOpacity(util, customEqualityTesters) {
      return {
        compare(element, expectedOpacity, tolerance) {
          if (tolerance == null) { tolerance = 0.0; }
          element = e.get(element);
          const actualOpacity = e.styleNumber(element, 'opacity');
          const result = {};
          result.pass =  Math.abs(expectedOpacity - actualOpacity) <= tolerance;
          if (!result.pass) {
            result.message = up.log.sprintf("Expected %o to have opacity %o, but it was %o", element, expectedOpacity, actualOpacity);
          }
          return result;
        }
      };
    }
  }));
})();
