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
    toMatchUrl(util, customEqualityTesters) {
      return {
        compare(actual, expected, normalizeOptions) {
          if (normalizeOptions == null) { normalizeOptions = {}; }
          let pass = true;
          if (pass) { pass = u.isString(actual); }
          if (pass) { pass = u.isString(expected); }
          if (pass) { pass = u.normalizeUrl(actual, normalizeOptions) === u.normalizeUrl(expected, normalizeOptions); }
          return { pass };
        }
      };
    }}));
  })();