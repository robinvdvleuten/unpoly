/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  let u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.popup', function() {

    u = up.util;

    describe('JavaScript functions', function() {

      describe('up.popup.attach', function() {

        beforeEach(() => jasmine.addMatchers({
          toSitBelow(util, customEqualityTesters) {
            return {
              compare($popup, $link) {
                const popupDims = $popup.get(0).getBoundingClientRect();
                const linkDims = $link.get(0).getBoundingClientRect();
                return {
                  pass:
                    (Math.abs(popupDims.left - linkDims.left) < 1.0) && (Math.abs(popupDims.top - linkDims.bottom) < 1.0)
                };
              }
            };
          }
        }));

        beforeEach(function() {
          return this.restoreBodyHeight = e.setTemporaryStyle(document.body, {minHeight: '3000px'});
        });

        afterEach(function() {
          return this.restoreBodyHeight();
        });

        it("loads this link's destination in a popup positioned under the given link", asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.css({
            position: 'absolute',
            left: '100px',
            top: '50px'
          });

          const $link = $container.affix('a[href="/path/to"][up-popup=".middle"]').text('link');

          up.popup.attach($link);

          next(() => {
            expect(this.lastRequest().url).toMatch(/\/path\/to$/);
            return this.respondWith(`\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `
            );
          });

          return next(() => {
            const $popup = $('.up-popup');
            expect($popup).toBeAttached();
            expect($popup.find('.middle')).toHaveText('new-middle');
            expect($popup.find('.before')).not.toBeAttached();
            expect($popup.find('.after')).not.toBeAttached();
            return expect($popup).toSitBelow($link);
          });
        })
        );

        it('always makes a request for the given selector, and does not "improve" the selector with a fallback', asyncSpec(function(next) {
          const $container = $fixture('.container');
          const $link = $container.affix('a[href="/path/to"][up-popup=".content"]').text('link');
          up.popup.attach($link);
          return next(() => {
            expect(jasmine.Ajax.requests.count()).toEqual(1);
            const headers = this.lastRequest().requestHeaders;
            return expect(headers['X-Up-Target']).toEqual('.content');
          });
        })
        );

        it('never resolves the open() promise and shows no error if close() was called before the response was received', asyncSpec(function(next) {
          const $span = $fixture('span');
          const openPromise = up.popup.attach($span, {url: '/foo', target: '.container'});

          next(() => {
            return up.popup.close();
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

        describe('with { html } option', () => it('extracts the selector from the given HTML string', asyncSpec(function(next) {
          const $span = $fixture('span');
          next.await(up.popup.attach($span, {target: '.container', html: "<div class='container'>container contents</div>"}));
          return next(() => expect($('.up-popup')).toHaveText('container contents'));
        })
        ));

        return describe('opening a popup while another modal is open', () => it('closes the current popup and wait for its close animation to finish before starting the open animation of a second popup', asyncSpec(function(next) {
          const $span = $fixture('span');
          up.popup.config.openAnimation = 'fade-in';
          up.popup.config.openDuration = 5;
          up.popup.config.closeAnimation = 'fade-out';
          up.popup.config.closeDuration = 60;

          const events = [];
          u.each(['up:popup:open', 'up:popup:opened', 'up:popup:close', 'up:popup:closed'], event => up.on(event, () => events.push(event)));

          up.popup.attach($span, { target: '.target', html: '<div class="target">response1</div>' });

          next(() => {
            // First popup is starting opening animation
            expect(events).toEqual(['up:popup:open']);
            return expect($('.target')).toHaveText('response1');
          });

          next.after(80, function() {
            // First popup has completed opening animation
            expect(events).toEqual(['up:popup:open', 'up:popup:opened']);
            expect($('.target')).toHaveText('response1');

            // We open another popup, which will cause the first modal to start closing
            return up.popup.attach($span, { target: '.target', html: '<div class="target">response2</div>' });
          });

          next.after(20, function() {
            // Second popup is still waiting for first popup's closing animation to finish.
            expect(events).toEqual(['up:popup:open', 'up:popup:opened', 'up:popup:close']);
            return expect($('.target')).toHaveText('response1');
          });

          return next.after(200, function() {
            // First popup has finished closing, second popup has finished opening.
            expect(events).toEqual(['up:popup:open', 'up:popup:opened', 'up:popup:close', 'up:popup:closed', 'up:popup:open', 'up:popup:opened']);
            return expect($('.target')).toHaveText('response2');
          });
        })
        ));
      });

      describe('up.popup.coveredUrl', () => describeCapability('canPushState', () => it('returns the URL behind the popup', asyncSpec(function(next) {
        up.history.config.enabled = true;
        up.history.replace('/foo');
        expect(up.popup.coveredUrl()).toBeMissing();

        const $popupLink = $fixture('a[href="/bar"][up-popup=".container"][up-history="true"]');
        Trigger.clickSequence($popupLink);

        next(() => {
          this.respondWith('<div class="container">text</div>');
          expect(up.popup.coveredUrl()).toMatchUrl('/foo');

          return next.await(up.popup.close());
        });

        return next(() => {
          return expect(up.popup.coveredUrl()).toBeMissing();
        });
      })
      )));

      describe('up.popup.close', () => it('should have tests'));

      return describe('up.popup.source', () => it('should have tests'));
    });

    return describe('unobtrusive behavior', function() {

      describe('a[up-popup]', function() {

        beforeEach(function() {
          return this.stubAttach = () => {
            this.$link = $fixture('a[href="/path"][up-popup=".target"]');
            this.attachSpy = up.popup.knife.mock('attachAsap').and.returnValue(Promise.resolve());
            return this.defaultSpy = spyOn(up.link, 'allowDefault').and.callFake(event => event.preventDefault());
          };
        });

        it('opens the clicked link in a popup', asyncSpec(function(next) {
          this.stubAttach();
          Trigger.click(this.$link);
          return next(() => expect(this.attachSpy).toHaveBeenCalledWith(this.$link[0], {}));
        })
        );

        // IE does not call JavaScript and always performs the default action on right clicks
        if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
          it('does nothing if the right mouse button is used', asyncSpec(function(next) {
            this.stubAttach();
            Trigger.click(this.$link, {button: 2});
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );
        }

        it('does nothing if shift is pressed during the click', asyncSpec(function(next) {
          this.stubAttach();
          Trigger.click(this.$link, {shiftKey: true});
          return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
        })
        );

        it('does nothing if ctrl is pressed during the click', asyncSpec(function(next) {
          this.stubAttach();
          Trigger.click(this.$link, {ctrlKey: true});
          return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
        })
        );

        it('does nothing if meta is pressed during the click', asyncSpec(function(next) {
          this.stubAttach();
          Trigger.click(this.$link, {metaKey: true});
          return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
        })
        );

        it('closes an existing popup before opening the new popup', asyncSpec(function(next) {
          up.popup.config.openDuration = 0;
          up.popup.config.closeDuration = 0;

          const $link1 = $fixture('a[href="/path1"][up-popup=".target"]');
          const $link2 = $fixture('a[href="/path2"][up-popup=".target"]');

          const events = [];
          u.each(['up:popup:open', 'up:popup:opened', 'up:popup:close', 'up:popup:closed'], event => up.on(event, () => events.push(event)));

          Trigger.click($link1);

          next(() => {
            expect(events).toEqual(['up:popup:open']);
            return this.respondWith('<div class="target">text1</div>');
          });

          next(() => {
            expect(events).toEqual(['up:popup:open', 'up:popup:opened']);
            return Trigger.click($link2);
          });

          next(() => {
            expect(events).toEqual(['up:popup:open', 'up:popup:opened', 'up:popup:close', 'up:popup:closed', 'up:popup:open']);
            return this.respondWith('<div class="target">text1</div>');
          });

          return next(() => {
            return expect(events).toEqual(['up:popup:open', 'up:popup:opened', 'up:popup:close', 'up:popup:closed', 'up:popup:open', 'up:popup:opened']);
        });}));


        describe('with [up-instant] modifier', function() {

          beforeEach(function() {
            this.stubAttach();
            return this.$link.attr('up-instant', '');
          });

          it('opens the modal on mousedown (instead of on click)', asyncSpec(function(next) {
            Trigger.mousedown(this.$link);
            return next(() => expect(this.attachSpy.calls.mostRecent().args[0]).toEqual(this.$link[0]));
          })
          );

          it('does nothing on mouseup', asyncSpec(function(next) {
            Trigger.mouseup(this.$link);
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing on click', asyncSpec(function(next) {
            Trigger.click(this.$link);
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );

          // IE does not call JavaScript and always performs the default action on right clicks
          if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
            it('does nothing if the right mouse button is pressed down', asyncSpec(function(next) {
              Trigger.mousedown(this.$link, {button: 2});
              return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
            })
            );
          }

          it('does nothing if shift is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {shiftKey: true});
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing if ctrl is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {ctrlKey: true});
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );

          return it('does nothing if meta is pressed during mousedown', asyncSpec(function(next) {
            Trigger.mousedown(this.$link, {metaKey: true});
            return next(() => expect(this.attachSpy).not.toHaveBeenCalled());
          })
          );
        });

        return describe('with [up-method] modifier', () => it('honours the given method', asyncSpec(function(next) {
          const $link = $fixture('a[href="/path"][up-popup=".target"][up-method="post"]');
          Trigger.click($link);

          return next(() => {
            return expect(this.lastRequest().method).toEqual('POST');
          });
        })
        ));
      });

      describe('[up-close]', function() {

        let backgroundClicked = undefined;

        beforeEach(function() {
          up.motion.config.enabled = false;
          backgroundClicked = jasmine.createSpy('background clicked');
          return up.on('click', backgroundClicked);
        });

        describe('when clicked inside a popup', () => it('closes the open popup and halts the event chain', asyncSpec(function(next) {
          const $opener = $fixture('a');
          up.popup.attach($opener, {html: '<div class="target">text</div>', target: '.target'});

          next(() => {
            const $popup = $fixture('.up-popup');
            const $closer = $popup.affix('a[up-close]'); // link is within the popup
            up.hello($closer);
            return Trigger.clickSequence($closer);
          });

          return next(() => {
            expect(up.popup.isOpen()).toBe(false);
            return expect(backgroundClicked).not.toHaveBeenCalled();
          });
        })
        ));

        describe('when clicked inside a popup when a modal is open', () => it('closes the popup, but not the modal', asyncSpec(function(next) {
          up.modal.extract('.modalee', '<div class="modalee"></div>');

          next(() => {
            const $modalee = $('.up-modal .modalee');
            const $opener = $modalee.affix('a');
            return up.popup.attach($opener, {html: '<div class="popupee">text</div>', target: '.popupee'});
          });

          next(() => {
            const $popupee = $('.up-popup .popupee');
            const $closer = $popupee.affix('a[up-close]'); // link is within the popup
            up.hello($closer);
            return Trigger.clickSequence($closer);
          });

          return next(() => {
            expect(up.popup.isOpen()).toBe(false);
            expect(up.modal.isOpen()).toBe(true);
            return expect(backgroundClicked).not.toHaveBeenCalled();
          });
        })
        ));

        return describe('when no popup is open', () => it('does nothing and allows the event chain to continue', asyncSpec(function(next) {
          const $link = $fixture('a[up-close]'); // link is outside the popup
          up.hello($link);
          Trigger.clickSequence($link);

          return next(() => {
            expect(up.popup.isOpen()).toBe(false);
            return expect(backgroundClicked).toHaveBeenCalled();
          });
        })
        ));
      });

      describe('when replacing content', function() {

        beforeEach(() => up.motion.config.enabled = false);

        it('prefers to replace a selector within the popup', asyncSpec(function(next) {
          const $outside = $fixture('.foo').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.foo', html: "<div class='foo'>old inside</div>"});

          next(() => {
            return up.extract('.foo', "<div class='foo'>new text</div>");
          });

          return next(() => {
            expect($outside).toBeAttached();
            expect($outside).toHaveText('old outside');
            return expect($('.up-popup')).toHaveText('new text');
          });
        })
        );

        it('auto-closes the popup when a replacement from inside the popup affects a selector behind the popup', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.inside', html: "<div class='inside'>old inside</div>"});

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>", {origin: $('.inside')});
          });

          return next(() => {
            expect($('.outside')).toHaveText('new outside');
            return expect($('.up-popup')).not.toBeAttached();
          });
        })
        );

        it('does not restore the covered URL when auto-closing (since it would override the URL from the triggering update)', asyncSpec(function(next) {
          up.history.config.enabled = true;
          up.motion.config.enabled = true;
          up.popup.config.openDuration = 0;
          up.popup.config.closeDuration = 20;
          up.popup.config.history = true;

          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {url: '/path', target: '.inside'});

          next(() => {
            return this.respondWith("<div class='inside'>old inside</div>");
          }); // Populate pop-up

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>",
              {origin: $('.inside'), history: '/new-location'});
          }); // Provoke auto-close

          return next(() => {
            return expect(location.href).toMatchUrl('/new-location');
          });
        })
        );

        it('does not auto-close the popup when a replacement from inside the popup affects a selector inside the popup', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {html: "<div class='inside'>old inside</div>", target: '.inside'});

          next(() => {
            return up.extract('.inside', "<div class='inside'>new inside</div>", {origin: $('.inside')});
          });

          return next(() => {
            expect($('.inside')).toHaveText('new inside');
            return expect($('.up-popup')).toBeAttached();
          });
        })
        );

        it('does not auto-close the popup when a replacement from outside the popup affects a selector outside the popup', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.inside', html: "<div class='inside'>old inside</div>"});

          next(() => {
            return up.extract('.outside', "<div class='outside'>new outside</div>", {origin: $('.outside')});
          });

          return next(() => {
            expect($('.outside')).toHaveText('new outside');
            return expect($('.up-popup')).toBeAttached();
          });
        })
        );

        return it('does not auto-close the popup when a replacement from outside the popup affects a selector inside the popup', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.inside', html: "<div class='inside'>old inside</div>"});

          next(() => {
            return up.extract('.inside', "<div class='inside'>new inside</div>", {origin: $('.outside')});
          });

          return next(() => {
            expect($('.inside')).toHaveText('new inside');
            return expect($('.up-popup')).toBeAttached();
          });
        })
        );
      });

      return describe('when clicking on the body', function() {

        beforeEach(() => up.motion.config.enabled = false);

        it('closes the popup', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return Trigger.clickSequence($('body'));
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(false);
          });
        })
        );

        it('closes the popup when a an [up-instant] link removes its parent (and thus a click event never bubbles up to the document)', asyncSpec(function(next) {
          const $parent = $fixture('.parent');
          const $parentReplacingLink = $parent.affix('a[href="/foo"][up-target=".parent"][up-instant]');
          const $popupOpener = $fixture('.link');
          up.popup.attach($popupOpener, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return Trigger.clickSequence($parentReplacingLink);
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(false);
          });
        })
        );

        it('closes the popup when the user clicks on an [up-target] link outside the popup', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideLink = $fixture('a[href="/foo"][up-target=".target"]');
          const $popupOpener = $fixture('.link');
          up.popup.attach($popupOpener, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return Trigger.clickSequence($outsideLink);
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(false);
          });
        })
        );

        it('closes the popup when the user clicks on an [up-instant] link outside the popup', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideLink = $fixture('a[href="/foo"][up-target=".target"][up-instant]');
          const $popupOpener = $fixture('.link');
          up.popup.attach($popupOpener, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return Trigger.clickSequence($outsideLink);
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(false);
          });
        })
        );

        it('does not close the popup if #preventDefault() is called on up:popup:close event', asyncSpec(function(next) {
          $fixture('.outside').text('old outside');
          const $link = $fixture('.link');
          up.popup.attach($link, {target: '.inside', html: "<div class='inside'>inside</div>"});

          up.on('up:popup:close', e => e.preventDefault());

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return Trigger.clickSequence($('body'));
          });

          return next(() => {
            expect(up.popup.isOpen()).toBe(true);

            // Since there isn't anyone who could handle the rejection inside
            // the event handler, our handler mutes the rejection.
            return expect(window).not.toHaveUnhandledRejections();
          });
        })
        );

        it('does not close the popup if a link outside the popup is followed with the up.follow function (bugfix)', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideLink = $fixture('a[href="/foo"][up-target=".target"]');
          const $popupOpener = $fixture('.link');
          up.popup.attach($popupOpener, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return up.follow($outsideLink);
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(true);
          });
        })
        );

        return it('does not close the popup if a form outside the popup is followed with the up.submit function (bugfix)', asyncSpec(function(next) {
          const $target = $fixture('.target');
          const $outsideForm = $fixture('form[action="/foo"][up-target=".target"]');
          const $popupOpener = $fixture('.link');
          up.popup.attach($popupOpener, {target: '.inside', html: "<div class='inside'>inside</div>"});

          next(() => {
            expect(up.popup.isOpen()).toBe(true);
            return up.submit($outsideForm);
          });

          return next(() => {
            return expect(up.popup.isOpen()).toBe(true);
          });
        })
        );
      });
    });
  });
})();