/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(() => jasmine.addMatchers({
    toBeError(util, customEqualityTesters) {
      return {
        compare(actual, message) {
          return {pass: (actual instanceof Error) && (!message || (message instanceof RegExp && message.test(actual.message)) || (actual.message === message))};
        }
      };
    }
  }));
})();
