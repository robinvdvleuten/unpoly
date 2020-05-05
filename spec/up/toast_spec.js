/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.toast', () => describe('JavaScript functions', () => describe('up.toast.open()', function() {

    it('opens a toast box with the given message', function() {
      up.toast.open('This is a message');
      expect('.up-toast').toBeAttached();
      return expect($('.up-toast-message').text()).toContain('This is a message');
    });

    it('opens a toast box with a close link', function() {
      up.toast.open('This is a message');
      expect('.up-toast').toBeAttached();
      const $closeButton = $('.up-toast-action:contains("Close")');
      expect($closeButton).toBeAttached();

      Trigger.clickSequence($closeButton);

      return expect('.up-toast').not.toBeAttached();
    });

    return it('opens a toast box with the given custom action', function() {
      const action = {
        label: 'Custom action',
        callback: jasmine.createSpy('action callback')
      };
      up.toast.open('This is a message', { action });
      const $actionButton = $('.up-toast-action:contains("Custom action")');
      expect($actionButton).toBeAttached();
      expect(action.callback).not.toHaveBeenCalled();

      Trigger.clickSequence($actionButton);

      return expect(action.callback).toHaveBeenCalled();
    });
  })));
})();