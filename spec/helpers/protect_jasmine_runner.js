/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(function() {
    up.fragment.config.fallbacks = ['.default-fallback'];
    up.history.config.popTargets = ['.default-fallback'];
    const $element = $('<div class="default-fallback"></div>');
    return $element.appendTo(document.body);
  });

  afterEach(() => up.destroy('.default-fallback', {log: false}));
})();
