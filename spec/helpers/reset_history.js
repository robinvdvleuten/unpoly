/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  const replaceStateHelperCount = 0;

  beforeAll(function() {
    this.hrefBeforeSuite = location.href;
    return this.titleBeforeSuite = document.title;
  });

  afterAll(function(done) {
    return up.util.task(() => {
      if (typeof history.replaceState === 'function') {
        history.replaceState({ fromResetPathHelper: true }, '', this.hrefBeforeSuite);
      }
      document.title = this.titleBeforeSuite;
      return done();
    });
  });

  beforeEach(function() {
    // Webkit ignores replaceState() calls after 100 calls / 30 sec.
    // So specs need to explicitely activate history handling.
    up.history.config.enabled = false;

    // Store original URL and title so we can restore it in afterEach.
    this.hrefBeforeExample = location.href;
    return this.titleBeforeExample = document.title;
  });
})();
