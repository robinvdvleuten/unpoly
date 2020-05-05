/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.modal', function() {

    beforeEach(function() {
      up.modal.config.openDuration = 5;
      return up.modal.config.closeDuration = 5;
    });

    describe('JavaScript functions', function() {

      describe('up.modal.follow', () => it("loads the given link's destination in a dialog window", function(done) {
        const $link = $fixture('a[href="/path/to"][up-modal=".middle"]').text('link');
        const promise = up.modal.follow($link);

        return u.task(() => {
          expect(this.lastRequest().url).toMatch(/\/path\/to$/);
          this.respondWith(`\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `
          );

          return promise.then(() => {
            expect($('.up-modal')).toBeAttached();
            expect($('.up-modal-dialog')).toBeAttached();
            expect($('.up-modal-dialog .middle')).toBeAttached();
            expect($('.up-modal-dialog .middle')).toHaveText('new-middle');
            expect($('.up-modal-dialog .before')).not.toBeAttached();
            expect($('.up-modal-dialog .after')).not.toBeAttached();
            return done();
          });
        });
      }));

      describe('up.modal.extract', () => it('opens a modal by extracting the given selector from the given HTML string', function(done) {
        up.history.config.enabled = true;

        const oldHref = location.href;
        const promise = up.modal.extract('.middle', `\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `
        );

        return promise.then(() => {
          expect($('.up-modal')).toBeAttached();
          expect($('.up-modal-dialog')).toBeAttached();
          expect($('.up-modal-dialog .middle')).toBeAttached();
          expect($('.up-modal-dialog .middle')).toHaveText('new-middle');
          expect($('.up-modal-dialog .before')).not.toBeAttached();
          expect($('.up-modal-dialog .after')).not.toBeAttached();

          // Can't change URLs
          expect(location.href).toEqual(oldHref);
          return done();
        });
      }));

      describe('up.modal.visit', function() {

        it("requests the given URL and places the given selector into a modal", function(done) {
          up.history.config.enabled = true;

          const promise = up.modal.visit('/foo', {target: '.middle'});

          u.task(() => {
            return this.respondWith(`\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `
            );
          });

          return promise.then(() => {
            expect('.up-modal').toBeAttached();
            expect('.up-modal-dialog').toBeAttached();
            expect('.up-modal-dialog .middle').toBeAttached();
            expect('.up-modal-dialog .middle').toHaveText('new-middle');
            expect('.up-modal-dialog .before').not.toBeAttached();
            expect('.up-modal-dialog .after').not.toBeAttached();
            expect(location.pathname).toMatchUrl('/foo');
            return done();
          });
        });

        it("doesn't create an .up-modal frame and replaces { failTarget } if the server returns a non-200 response", function(done) {
          $fixture('.error').text('old error');

          const promise = up.modal.visit('/foo', {target: '.target', failTarget: '.error'});

          u.task(() => {
            return this.respondWith({
              status: 500,
              responseText: `\
  <div class="target">new target</div>
  <div class="error">new error</div>\
  `
            });
          });

          return promise.catch(() => {
            expect('.up-modal').not.toBeAttached();
            expect('.error').toHaveText('new error');
            return done();
          });
        });

        it('always makes a request for the given selector, and does not "improve" the selector with a fallback', asyncSpec(function(next) {
          up.modal.visit('/foo', {target: '.target', failTarget: '.error'});
          return next(() => {
            expect(jasmine.Ajax.requests.count()).toEqual(1);
            const headers = this.lastRequest().requestHeaders;
            return expect(headers['X-Up-Target']).toEqual('.target');
          });
        })
        );

        describe('preventing elements from jumping as scrollbars change', function() {

          it("brings its own scrollbar, padding the body on the right", function(done) {
            const $body = $(document.body);

            $fixture('.spacer').css({height: '9000px'});
            // Safari 11 has no vertical scrollbar that takes away space from the document,
            // so the entire shifting logic is skipped.
            if (up.viewport.rootHasVerticalScrollbar()) {

              const $rootOverflowElement = $(up.viewport.rootOverflowElement());

              const promise = up.modal.visit('/foo', {target: '.container'});

              u.task(() => {
                return this.respondWith('<div class="container">text</div>');
              });

              return promise.then(function() {
                const $modal = $('.up-modal');
                const $viewport = $modal.find('.up-modal-viewport');
                const scrollbarWidth = up.viewport.scrollbarWidth();

                expect($modal).toBeAttached();
                expect($viewport.css('overflow-y')).toEqual('scroll');
                expect($rootOverflowElement.css('overflow-y')).toEqual('hidden');
                expect(parseInt($body.css('padding-right'))).toBeAround(scrollbarWidth, 5);

                return up.modal.close().then(function() {
                  expect($rootOverflowElement.css('overflow-y')).toEqual('scroll');
                  expect(parseInt($body.css('padding-right'))).toBe(0);
                  return done();
                });
              });
            } else {
              expect(true).toBe(true);
              return done();
            }
          });

          it("gives the scrollbar to .up-modal instead of .up-modal-viewport while animating, so we don't see scaled scrollbars in a zoom-in animation", function(done) {
            const openPromise = up.modal.extract('.container', '<div class="container">text</div>', {animation: 'fade-in', duration: 100});

            return u.timer(50, function() {
              const $modal = $('.up-modal');
              const $viewport = $modal.find('.up-modal-viewport');
              expect($modal).toHaveClass('up-modal-animating');
              expect($modal.css('overflow-y')).toEqual('scroll');
              expect($viewport.css('overflow-y')).toEqual('hidden');

              return openPromise.then(function() {
                expect($modal).not.toHaveClass('up-modal-animating');
                expect($modal.css('overflow-y')).not.toEqual('scroll');
                expect($viewport.css('overflow-y')).toEqual('scroll');
                const closePromise = up.modal.close({animation: 'fade-out', duration: 400});

                return u.timer(50, function() {
                  expect($modal).toHaveClass('up-modal-animating');
                  expect($modal.css('overflow-y')).toEqual('scroll');
                  expect($viewport.css('overflow-y')).toEqual('hidden');
                  return done();
                });
              });
            });
          });

          it("does not add right padding to the body if the document's overflow element has overflow-y: hidden", function(done) {
            const restoreBody = e.setTemporaryStyle(up.viewport.rootOverflowElement(), {overflowY: 'hidden'});
            $fixture('.spacer').css({height: '9000px'});

            return up.modal.extract('.container', '<div class="container">text</div>').then(function() {
              const $body = $('body');
              expect($('.up-modal')).toBeAttached();
              expect(parseInt($body.css('padding-right'))).toBe(0);

              return up.modal.close().then(function() {
                expect(parseInt($body.css('padding-right'))).toBe(0);
                restoreBody();
                return done();
              });
            });
          });

          it("does not add right padding to the body if the document's overflow element has overflow-y: auto, but does not currently have scrollbars", function(done) {
            const restoreBody = e.setTemporaryStyle(up.viewport.rootOverflowElement(), {overflowY: 'auto'});
            const restoreReporter = e.setTemporaryStyle($('.jasmine_html-reporter')[0], {height: '100px', overflowY: 'hidden'});

            return up.modal.extract('.container', '<div class="container">text</div>').then(function() {
              const $body = $('body');
              expect($('.up-modal')).toBeAttached();
              expect(parseInt($body.css('padding-right'))).toBe(0);

              return up.modal.close().then(function() {
                expect(parseInt($body.css('padding-right'))).toBe(0);
                restoreReporter();
                restoreBody();
                return done();
              });
            });
          });

          return it('pushes right-anchored elements away from the edge of the screen', function(done) {
            $fixture('.spacer').css({height: '9000px'});
            // Safari 11 has no vertical scrollbar that takes away space from the document,
            // so the entire shifting logic is skipped.
            if (up.viewport.rootHasVerticalScrollbar()) {
              const scrollbarWidth = up.viewport.scrollbarWidth();
              const $anchoredElement = $fixture('div[up-anchored=right]').css({
                position: 'absolute',
                top: '0',
                right: '30px'
              });

              const promise = up.modal.visit('/foo', {target: '.container'});

              u.task(() => {
                return this.respondWith('<div class="container">text</div>');
              });

              return promise.then(function() {
                expect(parseInt($anchoredElement.css('right'))).toBeAround(30 + scrollbarWidth, 10);

                return up.modal.close().then(function() {
                  expect(parseInt($anchoredElement.css('right'))).toBeAround(30 , 10);
                  return done();
                });
              });
            } else {
              expect(true).toBe(true);
              return done();
            }
          });
        });

        return describe('opening a modal while another modal is open', function() {

          it('does not open multiple modals or pad the body twice if the user starts loading a second modal before the first was done loading', function(done) {
            up.modal.config.closeDuration = 10;
            const scrollbarWidth = up.viewport.scrollbarWidth();
            
            // Load a first modal
            up.modal.visit('/path1', {target: '.container', animation: 'fade-in', duration: 50});

            // Immediately load a second modal in the same frame.
            // This will discard the first request immediately.
            up.modal.visit('/path2', {target: '.container', animation: 'fade-in', duration: 50});

            return u.task(() => {
              // The second modal has survived
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              expect(this.lastRequest().url).toMatchUrl('/path2');

              // We send the response for 2
              this.respondWith('<div class="container">response2</div>');

              return u.timer(10, () => {
                // The second modal is now opening
                up.modal.visit('/path3', {target: '.container', animation: 'fade-in', duration: 50});

                // Load a third modal before the second was done opening
                return u.task(() => {
                  // Since we're still opening the second modal, no request has been made.
                  expect(jasmine.Ajax.requests.count()).toEqual(1);

                  return u.timer(180, () => {
                    // Now that the second modal has opened, we make the request to /path3
                    expect(jasmine.Ajax.requests.count()).toEqual(2);
                    expect(this.lastRequest().url).toMatchUrl('/path3');

                    this.respondWith('<div class="container">response3</div>');

                    return u.timer(180, () => {
                      expect(jasmine.Ajax.requests.count()).toEqual(2);
                      expect($('.up-modal').length).toBe(1);
                      expect($('.up-modal-dialog').length).toBe(1);
                      expect($('.container')).toHaveText('response3');
                      const bodyPadding = parseInt($('body').css('padding-right'));
                      expect(bodyPadding).toBeAround(scrollbarWidth, 10);
                      if (scrollbarWidth > 0) { // this test does not make sense on old Safaris
                        expect(bodyPadding).not.toBeAround(2 * scrollbarWidth, 2 * 5);
                      }
                      return done();
                    });
                  });
                });
              });
            });
          });

          it('closes the current modal and wait for its close animation to finish before starting the open animation of a second modal', asyncSpec(function(next) {
            let timingTolerance;
            up.modal.config.openAnimation = 'fade-in';
            up.modal.config.openDuration = 100;
            up.modal.config.closeAnimation = 'fade-out';
            up.modal.config.closeDuration = 100;

            const events = [];
            u.each(['up:modal:open', 'up:modal:opened', 'up:modal:close', 'up:modal:closed'], event => up.on(event, () => events.push(event)));

            up.modal.extract('.target', '<div class="target">response1</div>');

            next(() => {
              // First modal is starting opening animation (will take 100 ms)
              expect(events).toEqual(['up:modal:open']);
              return expect($('.target')).toHaveText('response1');
            });

            next.after((100 + (timingTolerance = 100)), () => {
              // First modal has completed opening animation after 100 ms
              expect(events).toEqual(['up:modal:open', 'up:modal:opened']);
              expect($('.target')).toHaveText('response1');

              // We open another modal, which will cause the first modal to start closing (will take 100 ms)
              return up.modal.extract('.target', '<div class="target">response2</div>');
            });

            next.after(50, () => {
              // Second modal is still waiting for first modal's closing animaton to finish.
              expect(events).toEqual(['up:modal:open', 'up:modal:opened', 'up:modal:close']);
              return expect($('.target')).toHaveText('response1');
            });

            return next.after((50 + 100 + (timingTolerance = 200)), () => {
              // First modal has finished closing, second modal has finished opening.
              expect(events).toEqual(['up:modal:open', 'up:modal:opened', 'up:modal:close', 'up:modal:closed', 'up:modal:open', 'up:modal:opened']);
              return expect($('.target')).toHaveText('response2');
            });
          })
          );

          it('closes an opening modal if a second modal starts opening before the first modal has finished its open animation', asyncSpec(function(next) {
            let timingTolerance;
            up.modal.config.openAnimation = 'fade-in';
            up.modal.config.openDuration = 100;
            up.modal.config.closeAnimation = 'fade-out';
            up.modal.config.closeDuration = 100;

            // Open the first modal
            up.modal.extract('.target', '<div class="target">response1</div>');

            next.after(50, () => {
              // First modal is still in its opening animation
              expect($('.target')).toHaveText('response1');

              // Open a second modal
              return up.modal.extract('.target', '<div class="target">response2</div>');
            });

            next(() => {
              // First modal is starting close animation. Second modal waits for that.
              return expect($('.target')).toHaveText('response1');
            });

            next.after(10, () => {
              // Second modal is still waiting for first modal's closing animaton to finish.
              return expect($('.target')).toHaveText('response1');
            });

            return next.after((140 + (timingTolerance = 220)), () => {
              // First modal has finished closing, second modal has finished opening.
              return expect($('.target')).toHaveText('response2');
            });
          })
          );

          it('uses the correct flavor config for the first and second modal', asyncSpec(function(next) {
            up.modal.config.openAnimation = 'fade-in';
            up.modal.config.openDuration = 20;
            up.modal.config.closeAnimation = 'fade-out';
            up.modal.config.closeDuration = 20;
            up.modal.flavor('custom-drawer', {
              openAnimation: 'move-from-right',
              closeAnimation: 'move-to-right'
            }
            );

            const animations = [];
            spyOn(up, 'animate').and.callFake(function(element, animation, options) {
              if (e.matches(element, '.up-modal-viewport')) {
                animations.push({
                  text: element.querySelector('.target').innerText.trim(),
                  animation
                });
              }
              const deferred = u.newDeferred();
              u.timer(options.duration, () => deferred.resolve());
              return deferred.promise();
            });

            up.modal.extract('.target', '<div class="target">response1</div>');

            next(() => {
              return expect(animations).toEqual([
                { animation: 'fade-in', text: 'response1' }
              ]);
          });

            next.after(30, () => {
              // first modal is now done animating
              expect(animations).toEqual([
                { animation: 'fade-in', text: 'response1' }
              ]);

              return up.modal.extract('.target', '<div class="target">response2</div>', {flavor: 'custom-drawer'});
            });

            next(() => {
              return expect(animations).toEqual([
                { animation: 'fade-in', text: 'response1' },
                { animation: 'fade-out', text: 'response1' },
              ]);
          });

            return next.after(30, () => {
              expect(animations).toEqual([
                { animation: 'fade-in', text: 'response1' },
                { animation: 'fade-out', text: 'response1' },
                { animation: 'move-from-right', text: 'response2' }
              ]);

              return expect($('.up-modal').attr('up-flavor')).toEqual('custom-drawer');
            });
          })
          );


          return it('never resolves the open() promise and shows no error if close() was called before the response was received', asyncSpec(function(next) {
            const openPromise = up.modal.visit('/foo', {target: '.container'});

            next(() => {
              return up.modal.close();
            });

            next(() => {
              const respond = () => this.respondWith('<div class="container">text</div>');
              return expect(respond).not.toThrowError();
            });

            return next.await(() => {
              expect($('.up-toast')).not.toBeAttached();
              const promise = promiseState(openPromise);
              return promise.then(result => expect(result.state).toEqual('pending'));
            });
          })
          );
        });
      });

      describe('up.modal.coveredUrl', () => describeCapability('canPushState', () => it('returns the URL behind the modal overlay', function(done) {
        up.history.config.enabled = true;
        up.history.replace('/foo');

        expect(up.modal.coveredUrl()).toBeMissing();
        const visitPromise = up.modal.visit('/bar', {target: '.container'});
        return u.task(() => {
          this.respondWith('<div class="container">text</div>');
          return visitPromise.then(function() {
            expect(up.modal.coveredUrl()).toMatchUrl('/foo');
            return up.modal.close().then(function() {
              expect(up.modal.coveredUrl()).toBeMissing();
              return done();
            });
          });
        });
      })));

      describe('up.modal.flavors', function() {

        it('allows to register new modal variants with its own default configuration', asyncSpec(function(next) {
          up.modal.flavors.variant = { maxWidth: 200 };
          const $link = $fixture('a[href="/path"][up-modal=".target"][up-flavor="variant"]');
          Trigger.click($link);

          next(() => {
            return this.respondWith('<div class="target">new text</div>');
          });

          return next(() => {
            const $modal = $('.up-modal');
            const $dialog = $modal.find('.up-modal-dialog');
            expect($modal).toBeAttached();
            expect($modal.attr('up-flavor')).toEqual('variant');
            return expect($dialog.attr('style')).toContain('max-width: 200px');
          });
        })
        );

        return it('does not change the configuration of non-flavored modals', asyncSpec(function(next) {
          up.modal.flavors.variant = { maxWidth: 200 };
          const $link = $fixture('a[href="/path"][up-modal=".target"]');
          Trigger.click($link);

          next(() => {
            return this.respondWith('<div class="target">new text</div>');
          });

          return next(() => {
            const $modal = $('.up-modal');
            const $dialog = $modal.find('.up-modal-dialog');
            expect($modal).toBeAttached();
            return expect($dialog.attr('style')).toBeBlank();
          });
        })
        );
      });

      return describe('up.modal.close', function() {

        it('closes a currently open modal', function(done) {
          up.modal.extract('.content', '<div class="content">Modal content</div>');

          return u.task(() => {
            expect('.up-modal .content').toBeAttached();

            return up.modal.close().then(function() {
              expect('.up-modal .content').not.toBeAttached();
              return done();
            });
          });
        });

        return it('does nothing if no modal is open', function(done) {
          let wasClosed = false;
          up.on('up:modal:close', () => wasClosed = true);

          return up.modal.close().then(function() {
            expect(wasClosed).toBe(false);
            return done();
          });
        });
      });
    });

    return describe('unobtrusive behavior', function() {

      describe('a[up-modal]', function() {

        beforeEach(function() {
          up.motion.config.enabled = false;

          // Some examples only want to check if follow() has been called, without
          // actually making a request.
          return this.stubFollow = () => {
            this.$link = $fixture('a[href="/path"][up-modal=".target"]');
            this.followSpy = up.modal.knife.mock('followAsap').and.returnValue(Promise.resolve());
            return this.defaultSpy = spyOn(up.link, 'allowDefault').and.callFake(event => event.preventDefault());
          };
        });

        it('opens the clicked link in a modal', asyncSpec(function(next) {
          this.$link = $fixture('a[href="/path"][up-modal=".target"]');
          Trigger.click(this.$link);

          next(() => {
            const lastRequest = this.lastRequest();
            expect(lastRequest.url).toMatchUrl('/path');
            return this.respondWith('<div class="target">new content</div>');
          });

          return next(() => {
            expect('.up-modal').toBeAttached();
            return expect('.up-modal-content').toHaveText('new content');
          });
        })
        );

        describe('when modifier keys are held', function() {

          // IE does not call JavaScript and always performs the default action on right clicks
          if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
            it('does nothing if the right mouse button is used', asyncSpec(function(next) {
              this.stubFollow();
              Trigger.click(this.$link, {button: 2});
              return next(() => expect(this.followSpy).not.toHaveBeenCalled());
            })
            );
          }

          it('does nothing if shift is pressed during the click', asyncSpec(function(next) {
            this.stubFollow();
            Trigger.click(this.$link, {shiftKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing if ctrl is pressed during the click', asyncSpec(function(next) {
            this.stubFollow();
            Trigger.click(this.$link, {ctrlKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          return it('does nothing if meta is pressed during the click', asyncSpec(function(next) {
            this.stubFollow();
            Trigger.click(this.$link, {metaKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );
        });

        describe('with [up-instant] modifier', function() {

          beforeEach(function() {
            this.stubFollow();
            return this.$link.attr('up-instant', '');
          });

          it('opens the modal on mousedown (instead of on click)', asyncSpec(function(next) {
            Trigger.mousedown(this.$link);
            return next(() => {
              return expect(this.followSpy).toHaveBeenCalledWith(this.$link[0], {});
            });
          })
          );

          it('does nothing on mouseup', asyncSpec(function(next) {
            Trigger.mouseup(this.$link);
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing on click', asyncSpec(function(next) {
            Trigger.click(this.$link);
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          // IE does not call JavaScript and always performs the default action on right clicks
          if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
            it('does nothing if the right mouse button is pressed down', asyncSpec(function(next) {
              Trigger.mousedown(this.$link, {button: 2});
              return next(() => expect(this.followSpy).not.toHaveBeenCalled());
            })
            );
          }

          it('does nothing if shift is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {shiftKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing if ctrl is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {ctrlKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          return it('does nothing if meta is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {metaKey: true});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );
        });

        describe('with [up-method] modifier', () => it('honours the given method', asyncSpec(function(next) {
          const $link = $fixture('a[href="/path"][up-modal=".target"][up-method="post"]');
          Trigger.click($link);

          return next(() => {
            return expect(this.lastRequest().method).toEqual('POST');
          });
        })
        ));

        it('adds a history entry and allows the user to use the back button', asyncSpec(function(next) {
          let waitForBrowser;
          up.motion.config.enabled = false;
          up.history.config.enabled = true;
          up.history.config.popTargets = ['.container'];

          up.history.push('/original-path');

          const $container = $fixture('.container').text('old container content');
          const $link = $container.affix('a[href="/new-path"][up-modal=".target"]');

          expect(location.pathname).toEqual('/original-path');

          Trigger.clickSequence($link);

          next(() => {
            return this.respondWith('<div class="target">modal content</div>');
          });

          next(() => {
            expect(location.pathname).toEqual('/new-path');
            expect('.up-modal .target').toHaveText('modal content');

            return history.back();
          });

          next.after((waitForBrowser = 70), () => {
            return this.respondWith('<div class="container">restored container content</div>');
          });

          return next(() => {
            expect(location.pathname).toEqual('/original-path');
            expect('.container').toHaveText('restored container content');
            return expect('.up-modal').not.toBeAttached();
          });
        })
        );

        return it('allows to open a modal after closing a previous modal with the escape key (bugfix)', asyncSpec(function(next) {
          up.motion.config.enabled = false;

          const $link1 = $fixture('a[href="/path1"][up-modal=".target"]');
          const $link2 = $fixture('a[href="/path2"][up-modal=".target"]');
          Trigger.clickSequence($link1);

          next(() => {
            return this.respondWith('<div class="target">content 1</div>');
          });

          next(() => {
            expect(up.modal.isOpen()).toBe(true);

            return Trigger.escapeSequence(document.body);
          });

          next(() => {
            expect(up.modal.isOpen()).toBe(false);

            return Trigger.clickSequence($link2);
          });

          next(() => {
            return this.respondWith('<div class="target">content 1</div>');
          });

          return next(() => {
            return expect(up.modal.isOpen()).toBe(true);
          });
        })
        );
      });


      describe('[up-drawer]', function() {

        beforeEach(() => up.motion.config.enabled = false);

        it('slides in a drawer that covers the full height of the screen', asyncSpec(function(next) {
          const $link = $fixture('a[href="/qux"][up-drawer=".target"]').text('label');
          up.hello($link);
          Trigger.clickSequence($link);

          next(() => {
            return this.respondWith('<div class="target">new text</div>');
          });

          return next(() => {
            expect(up.modal.isOpen()).toBe(true);
            expect($('.up-modal').attr('up-flavor')).toEqual('drawer');
            const windowHeight = up.viewport.rootHeight();
            const modalHeight = $('.up-modal-content').outerHeight();
            expect(modalHeight).toEqual(windowHeight);
            return expect($('.up-modal-content').offset()).toEqual({top: 0, left: 0});
          });
        })
        );

        return it('puts the drawer on the right if the opening link sits in the right 50% of the screen', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-drawer=".target"]').text('label');
          $link.css({
            position: 'absolute',
            right: '0'
          });
          up.hello($link);
          Trigger.clickSequence($link);

          next(() => {
            return this.respondWith('<div class="target">new text</div>');
          });

          return next(() => {
            expect(up.modal.isOpen()).toBe(true);
            const windowWidth = up.viewport.rootWidth();
            const modalWidth = $('.up-modal-content').outerWidth();
            const scrollbarWidth = up.viewport.scrollbarWidth();
            return expect($('.up-modal-content').offset().left).toBeAround(windowWidth - modalWidth - scrollbarWidth, 1.0);
          });
        })
        );
      });

      describe('[up-close]', function() {

        let backgroundClicked = undefined;

        beforeEach(function() {
          up.motion.config.enabled = false;
          backgroundClicked = jasmine.createSpy('background clicked');
          return up.on('click', backgroundClicked);
        });

        describe('when clicked inside a modal', () => it('closes the open modal and halts the event chain', asyncSpec(function(next) {
          up.modal.extract('.target', '<div class="target"><a up-close>text</a></div>', {animation: false});

          next(() => {
            const $link = $('.up-modal a[up-close]'); // link is within the modal
            return Trigger.clickSequence($link);
          });

          return next(() => {
            expect(up.modal.isOpen()).toBe(false);
            return expect(backgroundClicked).not.toHaveBeenCalled();
          });
        })
        ));


        return describe('when no modal is open', () => it('does nothing and allows the event chain to continue', asyncSpec(function(next) {
          const $link = $fixture('a[up-close]'); // link is outside the modal
          up.hello($link);
          Trigger.clickSequence($link);

          return next(() => {
            return expect(backgroundClicked).toHaveBeenCalled();
          });
        })
        ));
      });

      describe('closing', function() {

        it('closes the modal on close icon click', asyncSpec(function(next) {
          up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false});

          next(() => {
            const $closeIcon = $('.up-modal-close');
            return Trigger.clickSequence($closeIcon);
          });

          return next(() => {
            return expect(up.modal.isOpen()).toBe(false);
          });
        })
        );

        it('closes the modal on backdrop click', asyncSpec(function(next) {
          up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false});

          next(() => {
            const $backdrop = $('.up-modal-backdrop');
            return Trigger.clickSequence($backdrop);
          });

          return next(() => {
            return expect(up.modal.isOpen()).toBe(false);
          });
        })
        );

        it("does not close the modal when clicking on an element outside the modal's DOM hierarchy", asyncSpec(function(next) {
          const $container = $fixture('.container');
          up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false});

          next(() => {
            return Trigger.clickSequence($container);
          });

          return next(() => {
            return expect(up.modal.isOpen()).toBe(true);
          });
        })
        );

        it('closes the modal when the user presses the escape key', asyncSpec(function(next) {
          let wasClosed = false;
          up.on('up:modal:close', () => wasClosed = true);

          up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false});

          next(() => {
            return Trigger.escapeSequence(document.body);
          });

          return next(() => {
            return expect(wasClosed).toBe(true);
          });
        })
        );

        it('stays open if #preventDefault() is called on up:modal:close event', asyncSpec(function(next) {
          up.modal.extract('.target', '<div class="target"><a up-close>text</a></div>', {animation: false});
          up.on('up:modal:close', e => e.preventDefault());

          next(() => {
            const $backdrop = $('.up-modal-backdrop');
            return Trigger.clickSequence($backdrop);
          });

          return next(() => {
            expect(up.modal.isOpen()).toBe(true);

            // Since there isn't anyone who could handle the rejection inside
            // the event handler, our handler mutes the rejection.
            return expect(window).not.toHaveUnhandledRejections();
          });
        })
        );

        return describe('when opened with { closable: false }', function() {

          it('does not render a close icon', asyncSpec(function(next) {
            up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false, closable: false});

            return next(() => {
              return expect('.up-modal').not.toHaveDescendant('.up-modal-close');
            });
          })
          );

          it('does not close the modal on backdrop click', asyncSpec(function(next) {
            up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false, closable: false});

            next(() => {
              const $backdrop = $('.up-modal-backdrop');
              return Trigger.clickSequence($backdrop);
            });

            return next(() => {
              return expect(up.modal.isOpen()).toBe(true);
            });
          })
          );

          return it('does not close the modal when the user presses the escape key', asyncSpec(function(next) {
            up.modal.extract('.modal', '<div class="modal">Modal content</div>', {animation: false, closable: false});

            next(() => {
              return Trigger.escapeSequence(document.body);
            });

            return next(() => {
              return expect(up.modal.isOpen()).toBe(true);
            });
          })
          );
        });
      });

      return describe('when replacing content', function() {

        beforeEach(() => up.motion.config.enabled = false);

        it('prefers to replace a selector within the modal', asyncSpec(function(next) {
          const $outside = $fixture('.foo').text('old outside');
          up.modal.visit('/path', {target: '.foo'});

          next(() => {
            return this.respondWith("<div class='foo'>old inside</div>");
          });

          next(() => {
            return up.extract('.foo', "<div class='foo'>new text</div>");
          });

          return next(() => {
            expect($outside).toBeAttached();
            expect($outside).toHaveText('old outside');
            return expect($('.up-modal-content')).toHaveText('new text');
          });
        })
        );

        it('auto-closes the modal when a replacement from inside the modal affects a selector behind the modal', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          up.modal.visit('/path', {target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          });

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>", {origin: $('.inside')});
          });

          return next(() => {
            expect($('.outside')).toHaveText('new outside');
            return expect($('.up-modal')).not.toBeAttached();
          });
        })
        );

        it('does not restore the covered URL when auto-closing (since it would override the URL from the triggering update)', asyncSpec(function(next) {
          up.history.config.enabled = true;
          up.motion.config.enabled = true;
          up.modal.config.openDuration = 0;
          up.modal.config.closeDuration = 20;

          $fixture('.outside').text('old outside');
          up.modal.visit('/path', {target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          }); // Populate modal

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>",
              {origin: $('.inside'), history: '/new-location'});
          }); // Provoke auto-close

          return next(() => {
            return expect(location.href).toMatchUrl('/new-location');
          });
        })
        );

        it('does not auto-close the modal when a replacement from inside the modal affects a selector inside the modal', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          up.modal.visit('/path', {target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          });

          next(() => {
            return up.extract('.inside', "<div class='inside'>new inside</div>", {origin: $('.inside')});
          });

          return next(() => {
            expect($('.inside')).toHaveText('new inside');
            return expect($('.up-modal')).toBeAttached();
          });
        })
        );

        it('does not auto-close the modal when a replacement from outside the modal affects a selector outside the modal', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          up.modal.visit('/path', {target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          });

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>", {origin: $('.outside')});
          });

          return next(() => {
            expect($('.outside')).toHaveText('new outside');
            return expect($('.up-modal')).toBeAttached();
          });
        })
        );

        it('does not auto-close the modal when a replacement from outside the modal affects a selector inside the modal', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          up.modal.visit('/path', {target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          });

          next(() => {
            return up.extract('.inside', "<div class='inside'>new inside</div>", {origin: $('.outside')});
          });

          return next(() => {
            expect($('.inside')).toHaveText('new inside');
            return expect($('.up-modal')).toBeAttached();
          });
        })
        );

        it('does not auto-close the modal when the new fragment is within a popup', asyncSpec(function(next) {
          up.modal.visit('/modal', {target: '.modal-content'});

          next(() => {
            return this.respondWith("<div class='modal-content'></div>");
          });

          next(() => {
            return up.popup.attach('.modal-content', {url: '/popup', target: '.popup-content'});
          });

          next(() => {
            return this.respondWith("<div class='popup-content'></div>");
          });

          return next(() => {
            expect($('.up-modal')).toBeAttached();
            return expect($('.up-popup')).toBeAttached();
          });
        })
        );

        return it('does not close the modal when a clicked [up-target] link within the modal links to cached content (bugfix)', asyncSpec(function(next) {
          up.modal.extract('.content', `\
  <div class="content">
    <a href="/foo" up-target=".content">link</a>
  </div>\
  `
          );

          next(() => {
            const $link = $('.up-modal .content a');
            expect($link).toBeAttached();
            return up.proxy.preload($link);
          });

          next(() => {
            return this.respondWith(`\
  <div class="content">
    new text
  </div>\
  `
            );
          });

          next(() => {
            return Trigger.clickSequence('.up-modal .content a');
          });

          return next(() => {
            expect($('.up-modal')).toBeAttached();
            return expect($('.up-modal .content')).toHaveText('new text');
          });
        })
        );
      });
    });
  });
})();