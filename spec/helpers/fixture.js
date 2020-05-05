/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const e = up.element;
  const $ = jQuery;

  let fixturesContainer = undefined;

  const ensureContainerExists = () => fixturesContainer || (fixturesContainer = e.affix(document.body, '.fixtures'));

  afterEach(function() {
    if (fixturesContainer) {
      e.remove(fixturesContainer);
      return fixturesContainer = undefined;
    }
  });

  const appendFixture = function(...args) {
    const container = ensureContainerExists();
    return e.affix(container, ...Array.from(args));
  };

  const $appendFixture = (...args) => $(appendFixture(...Array.from(args || [])));

  window.fixture = appendFixture;
  window.$fixture = $appendFixture;

  // A lot of legacy tests require this jQuery function
  $.fn.affix = function(...args) { return $(e.affix(this[0], ...Array.from(args))); };
})();