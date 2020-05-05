/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('Jasmine setup', () => it('does not consider a jQuery collection to be equal to its contained element (which is what jasmine-jquery does and which makes out expectations too soft)', function() {
    const element = document.createElement('div');
    const $element = $(element);
    return expect($element).not.toEqual(element);
  }));
})();