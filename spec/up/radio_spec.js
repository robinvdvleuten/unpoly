/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.radio', function() {

    describe('JavaScript functions', function() {});

    return describe('unobtrusive behavior', () => describe('[up-hungry]', function() {

      it("replaces the element when it is found in a response, even when the element wasn't targeted", asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');

        up.replace('.target', '/path');

        next(() => {
          return this.respondWith(`\
  <div class="target">
  new target
  </div>
  <div class="between">
  new between
  </div>
  <div class="hungry">
  new hungry
  </div>\
  `
          );
        });

        return next(() => {
          expect('.target').toHaveText('new target');
          return expect('.hungry').toHaveText('new hungry');
        });
      })
      );

      it("does not impede replacements when the element is not part of a response", asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');

        const promise = up.replace('.target', '/path');

        next(() => {
          return this.respondWith(`\
  <div class="target">
  new target
  </div>\
  `
          );
        });

        return next(() => {
          expect('.target').toHaveText('new target');
          expect('.hungry').toHaveText('old hungry');

          return promiseState(promise).then(result => expect(result.state).toEqual('fulfilled'));
        });
      })
      );

      it('still reveals the element that was originally targeted', asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');

        const revealStub = up.viewport.knife.mock('reveal');

        up.replace('.target', '/path', {reveal: true});

        next(() => {
          return this.respondWith(`\
  <div class="target">
  new target
  </div>\
  `
          );
        });

        return next(() => {
          expect(revealStub).toHaveBeenCalled();
          const revealArg = revealStub.calls.mostRecent().args[0];
          expect(revealArg).not.toMatchSelector('.hungry');
          return expect(revealArg).toMatchSelector('.target');
        });
      })
      );


      it('does not change the X-Up-Target header for the request', asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');
        $fixture('.fail-target').text('old fail target');

        up.replace('.target', '/path', {failTarget: '.fail-target'});

        return next(() => {
          expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.target');
          return expect(this.lastRequest().requestHeaders['X-Up-Fail-Target']).toEqual('.fail-target');
        });
      })
      );

      it('does replace the element when the server responds with an error (e.g. for error flashes)', asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');
        $fixture('.fail-target').text('old fail target');

        up.replace('.target', '/path', {failTarget: '.fail-target'});

        next(() => {
          return this.respondWith({
            status: 500,
            responseText: `\
  <div class="target">
  new target
  </div>
  <div class="fail-target">
  new fail target
  </div>
  <div class="between">
  new between
  </div>
  <div class="hungry">
  new hungry
  </div>\
  `
          });
        });

        return next(() => {
          expect('.target').toHaveText('old target');
          expect('.fail-target').toHaveText('new fail target');
          return expect('.hungry').toHaveText('new hungry');
        });
      })
      );


      it('does not update [up-hungry] elements with { hungry: false } option', asyncSpec(function(next) {
        $fixture('.hungry[up-hungry]').text('old hungry');
        $fixture('.target').text('old target');

        up.replace('.target', '/path', {hungry: false});

        next(() => {
          return this.respondWith({
            responseText: `\
  <div class="target">
  new target
  </div>
  <div class="hungry">
  new hungry
  </div>\
  `
          });
        });

        return next(() => {
          expect('.target').toHaveText('new target');
          return expect('.hungry').toHaveText('old hungry');
        });
      })
      );

      it('does not auto-close a non-sticky modal if a link within the modal changes both modal content and an [up-hungry] below', asyncSpec(function(next) {
        up.modal.config.openDuration = 0;
        up.modal.config.closeDuration = 0;

        $fixture('.outside').text('old outside').attr('up-hungry', true);

        const closeEventHandler = jasmine.createSpy('close event handler');
        up.on('up:modal:close', closeEventHandler);

        up.modal.extract('.inside', `\
  <div class='inside'>
  <div class="inside-text">old inside</div>
  <div class="inside-link">update</div>
  </div>\
  `
        );

        next(() => {
          expect(up.modal.isOpen()).toBe(true);

          return up.extract('.inside-text', `\
  <div class="outside">
  new outside
  </div>
  <div class='inside'>
  <div class="inside-text">new inside</div>
  <div class="inside-link">update</div>
  </div>\
  `,
            {origin: $('.inside-link')});
        });

        return next(() => {
          expect(closeEventHandler).not.toHaveBeenCalled();
          expect($('.inside-text')).toHaveText('new inside');
          return expect($('.outside')).toHaveText('new outside');
        });
      })
      );

      return it('does not auto-close a non-sticky popup if a link within the modal replaces an [up-hungry] below', asyncSpec(function(next) {
        up.popup.config.openDuration = 0;
        up.popup.config.closeDuration = 0;

        $fixture('.outside').text('old outside').attr('up-hungry', true);
        const $popupAnchor = $fixture('span.link').text('link');

        const closeEventHandler = jasmine.createSpy('close event handler');
        up.on('up:popup:close', closeEventHandler);

        up.popup.attach($popupAnchor, {
          target: '.inside',
          html: `\
  <div class='inside'>
  <div class="inside-text">old inside</div>
  <div class="inside-link">update</div>
  </div>\
  `
        }
        );

        next(() => {
          expect(up.popup.isOpen()).toBe(true);

          return up.extract('.inside-text', `\
  <div class="outside">
  new outside
  </div>
  <div class='inside'>
  <div class="inside-text">new inside</div>
  <div class="inside-link">update</div>
  </div>\
  `,
            {origin: $('.inside-link')});
        });

        return next(() => {
          expect(closeEventHandler).not.toHaveBeenCalled();
          expect($('.inside-text')).toHaveText('new inside');
          return expect($('.outside')).toHaveText('new outside');
        });
      })
      );
    }));
  });
})();