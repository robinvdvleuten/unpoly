/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  afterEach(function(done) {
    // If the spec has installed the Jasmine clock, uninstall it so
    // the timeout below will actually happen.
    jasmine.clock().uninstall();

    // Most pending promises will wait for an animation to finish.
    const promise = up.motion.finish();

    return u.always(promise, () => // Wait one more frame so pending callbacks have a chance to run.
    // Pending callbacks might change the URL or cause errors that bleed into
    // the next example.
    up.util.task(() => {
      up.framework.reset();
      up.browser.popCookie(up.protocol.config.methodCookie);

      // Give async reset behavior another frame to play out,
      // then start the next example.
      return up.util.task(function() {
        $('.up-toast').remove();
        return done();
      });
    }));
  });
})();
