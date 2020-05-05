/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  let UNHANDLED_REJECTIONS = [];
  // In Firefox promise events are disabled by default.
  // We need to enable them in about:config.
  window.REJECTION_EVENTS_SUPPORTED = (Array.from(window).includes("onunhandledrejection"));

  beforeAll(() => window.addEventListener('unhandledrejection', event => UNHANDLED_REJECTIONS.push(event)));

  beforeEach(function() {
    UNHANDLED_REJECTIONS = [];

    return jasmine.addMatchers({
      toHaveUnhandledRejections(util, customEqualityTesters) {
        return {
          compare(actual) {
            // It doesn't really matter what's in actual.
            // A good way to call this is e.g. `expect(window).not.toHaveUnhandledRejections()
            return {pass: UNHANDLED_REJECTIONS.length > 0};
          }
        };
      }
    });
  });
})();
