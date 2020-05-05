/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  beforeEach(function() {
    this.lastRequest = () => jasmine.Ajax.requests.mostRecent() || u.fail('There is no last request');

    return this.respondWith = function(...args) {
      const firstArg = args.shift();
      let responseText = undefined;
      let options = undefined;
      if (u.isString(firstArg)) {
        responseText = firstArg;
        options = args[0] || {};
      } else {
        options = firstArg;
        responseText = options.responseText || 'response-text';
      }
      const request = options.request || this.lastRequest();
      return request.respondWith({
        status: options.status || 200,
        contentType: options.contentType || 'text/html',
        responseHeaders: options.responseHeaders,
        responseText,
        responseURL: options.responseURL
      });
    };
  });
})();