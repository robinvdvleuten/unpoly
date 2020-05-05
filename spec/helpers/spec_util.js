/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  up.specUtil = (function() {

    /***
    Returns whether the given element has been detached from the DOM
    (or whether it was never attached).

    @function up.util.isDetached
    @internal
    */
    const isDetached = function(element) {
      element = e.get(element);
      // This is by far the fastest way to do this
      return !$.contains(document.documentElement, element);
    };

    const isAttached = element => !isDetached(element);

    const isVisible = element => $(element).is(':visible');

    const isHidden = element => $(element).is(':hidden');

    /***
    @function up.util.promiseTimer
    @internal
    */
    const promiseTimer = function(ms) {
      let timeout = undefined;
      const promise = new Promise((resolve, reject) => timeout = u.timer(ms, resolve));
      promise.cancel = () => clearTimeout(timeout);
      return promise;
    };


    return {
      isDetached,
      isAttached,
      isVisible,
      isHidden,
      promiseTimer
    };
  })();
})();