/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  let u = up.util;
  const $ = jQuery;

  describe('up.link', function() {

    u = up.util;

    describe('JavaScript functions', function() {
    
      describe('up.follow', function() {

        it('emits a preventable up:link:follow event', asyncSpec(function(next) {
          const $link = $fixture('a[href="/destination"][up-target=".response"]');

          const listener = jasmine.createSpy('follow listener').and.callFake(event => event.preventDefault());

          $link.on('up:link:follow', listener);

          up.follow($link);

          return next(() => {
            expect(listener).toHaveBeenCalled();
            const event = listener.calls.mostRecent().args[0];
            expect(event.target).toEqual($link[0]);

            // No request should be made because we prevented the event
            return expect(jasmine.Ajax.requests.count()).toEqual(0);
          });
        })
        );

        describeCapability('canPushState', function() {

          it('loads the given link via AJAX and replaces the response in the given target', asyncSpec(function(next) {
            $fixture('.before').text('old-before');
            $fixture('.middle').text('old-middle');
            $fixture('.after').text('old-after');
            const $link = $fixture('a[href="/path"][up-target=".middle"]');
      
            up.follow($link);

            next(() => {
              return this.respondWith(`\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `
              );
            });

            return next(() => {
              expect($('.before')).toHaveText('old-before');
              expect($('.middle')).toHaveText('new-middle');
              return expect($('.after')).toHaveText('old-after');
            });
          })
          );

          it('uses the method from a data-method attribute', asyncSpec(function(next) {
            const $link = $fixture('a[href="/path"][data-method="PUT"]');
            up.follow($link);

            return next(() => {
              const request = this.lastRequest();
              return expect(request).toHaveRequestMethod('PUT');
            });
          })
          );

          it('allows to refer to the link itself as "&" in the CSS selector', asyncSpec(function(next) {
            const $container = $fixture('div');
            const $link1 = $('<a id="first" href="/path" up-target="&">first-link</a>').appendTo($container);
            const $link2 = $('<a id="second" href="/path" up-target="&">second-link</a>').appendTo($container);
            up.follow($link2);

            next(() => this.respondWith('<div id="second">second-div</div>'));
            return next(() => expect($container.text()).toBe('first-linksecond-div'));
          })
          );

          it('adds history entries and allows the user to use the back- and forward-buttons', asyncSpec(function(next) {
            up.history.config.enabled = true;

            const waitForBrowser = 100;

            // By default, up.history will replace the <body> tag when
            // the user presses the back-button. We reconfigure this
            // so we don't lose the Jasmine runner interface.
            up.history.config.popTargets = ['.container'];

            const respondWith = (html, title) => {
              return this.lastRequest().respondWith({
                status: 200,
                contentType: 'text/html',
                responseText: `<div class='container'><div class='target'>${html}</div></div>`,
                responseHeaders: { 'X-Up-Title': title }});
            };

  //          followAndRespond = ($link, html, title) ->
  //            promise = up.follow($link)
  //            respondWith(html, title)
  //            promise

            const $link1 = $fixture('a[href="/one"][up-target=".target"]');
            const $link2 = $fixture('a[href="/two"][up-target=".target"]');
            const $link3 = $fixture('a[href="/three"][up-target=".target"]');
            const $container = $fixture('.container');
            const $target = $fixture('.target').appendTo($container).text('original text');

            up.follow($link1);

            next(() => {
              return respondWith('text from one', 'title from one');
            });

            next(() => {
              expect($('.target')).toHaveText('text from one');
              expect(location.pathname).toEqual('/one');
              expect(document.title).toEqual('title from one');

              return up.follow($link2);
            });

            next(() => {
              return respondWith('text from two', 'title from two');
            });

            next(() => {
              expect($('.target')).toHaveText('text from two');
              expect(location.pathname).toEqual('/two');
              expect(document.title).toEqual('title from two');

              return up.follow($link3);
            });

            next(() => {
              return respondWith('text from three', 'title from three');
            });

            next(() => {
              expect($('.target')).toHaveText('text from three');
              expect(location.pathname).toEqual('/three');
              expect(document.title).toEqual('title from three');

              return history.back();
            });

            next.after(waitForBrowser, () => {
              return respondWith('restored text from two', 'restored title from two');
            });

            next(() => {
              expect($('.target')).toHaveText('restored text from two');
              expect(location.pathname).toEqual('/two');
              expect(document.title).toEqual('restored title from two');

              return history.back();
            });

            next.after(waitForBrowser, () => {
              return respondWith('restored text from one', 'restored title from one');
            });

            next(() => {
              expect($('.target')).toHaveText('restored text from one');
              expect(location.pathname).toEqual('/one');
              expect(document.title).toEqual('restored title from one');

              return history.forward();
            });

            return next.after(waitForBrowser, () => {
              // Since the response is cached, we don't have to respond
              expect($('.target')).toHaveText('restored text from two', 'restored title from two');
              expect(location.pathname).toEqual('/two');
              return expect(document.title).toEqual('restored title from two');
            });
          })
          );

          it('does not add additional history entries when linking to the current URL', asyncSpec(function(next) {
            up.history.config.enabled = true;

            // By default, up.history will replace the <body> tag when
            // the user presses the back-button. We reconfigure this
            // so we don't lose the Jasmine runner interface.
            up.history.config.popTargets = ['.container'];

            up.proxy.config.cacheExpiry = 0;

            const respondWith = text => {
              return this.respondWith(`\
  <div class="container">
    <div class='target'>${text}</div>
  </div>\
  `
              );
            };

            const $link1 = $fixture('a[href="/one"][up-target=".target"]');
            const $link2 = $fixture('a[href="/two"][up-target=".target"]');
            const $container = $fixture('.container');
            const $target = $fixture('.target').appendTo($container).text('original text');

            up.follow($link1);

            next(() => {
              return respondWith('text from one');
            });

            next(() => {
              expect($('.target')).toHaveText('text from one');
              expect(location.pathname).toEqual('/one');

              return up.follow($link2);
            });

            next(() => {
              return respondWith('text from two');
            });

            next(() => {
              expect($('.target')).toHaveText('text from two');
              expect(location.pathname).toEqual('/two');

              return up.follow($link2);
            });

            next(() => {
              return respondWith('text from two');
            });

            next(() => {
              expect($('.target')).toHaveText('text from two');
              expect(location.pathname).toEqual('/two');

              return history.back();
            });

            next.after(100, () => {
              return respondWith('restored text from one');
            });

            next(() => {
              expect($('.target')).toHaveText('restored text from one');
              expect(location.pathname).toEqual('/one');

              return history.forward();
            });

            next.after(100, () => {
              return respondWith('restored text from two');
            });

            return next(() => {
              expect($('.target')).toHaveText('restored text from two');
              return expect(location.pathname).toEqual('/two');
            });
          })
          );

          it('does add additional history entries when linking to the current URL, but with a different hash', asyncSpec(function(next) {
            up.history.config.enabled = true;

            // By default, up.history will replace the <body> tag when
            // the user presses the back-button. We reconfigure this
            // so we don't lose the Jasmine runner interface.
            up.history.config.popTargets = ['.container'];

            up.proxy.config.cacheExpiry = 0;

            const respondWith = text => {
              return this.respondWith(`\
  <div class="container">
    <div class='target'>${text}</div>
  </div>\
  `
              );
            };

            const $link1 = $fixture('a[href="/one"][up-target=".target"]');
            const $link2 = $fixture('a[href="/two"][up-target=".target"]');
            const $link2WithHash = $fixture('a[href="/two#hash"][up-target=".target"]');
            const $container = $fixture('.container');
            const $target = $fixture('.target').appendTo($container).text('original text');

            up.follow($link1);

            next(() => {
              return respondWith('text from one');
            });

            next(() => {
              expect($('.target')).toHaveText('text from one');
              expect(location.pathname).toEqual('/one');
              expect(location.hash).toEqual('');

              return up.follow($link2);
            });

            next(() => {
              return respondWith('text from two');
            });

            next(() => {
              expect($('.target')).toHaveText('text from two');
              expect(location.pathname).toEqual('/two');
              expect(location.hash).toEqual('');

              return up.follow($link2WithHash);
            });

            next(() => {
              return respondWith('text from two with hash');
            });

            next(() => {
              expect($('.target')).toHaveText('text from two with hash');
              expect(location.pathname).toEqual('/two');
              expect(location.hash).toEqual('#hash');

              return history.back();
            });

            next.after(100, () => {
              return respondWith('restored text from two');
            });

            next(() => {
              expect($('.target')).toHaveText('restored text from two');
              expect(location.pathname).toEqual('/two');
              expect(location.hash).toEqual('');

              return history.forward();
            });

            next.after(100, () => {
              return respondWith('restored text from two with hash');
            });

            return next(() => {
              expect($('.target')).toHaveText('restored text from two with hash');
              expect(location.pathname).toEqual('/two');
              return expect(location.hash).toEqual('#hash');
            });
          })
          );

          describe('with { restoreScroll: true } option', function() {

            beforeEach(() => up.history.config.enabled = true);

            return it('does not reveal, but instead restores the scroll positions of all viewports around the target', asyncSpec(function(next) {

              const $viewport = $fixture('div[up-viewport] .element').css({
                'height': '100px',
                'width': '100px',
                'overflow-y': 'scroll'
              });

              const followLink = function(options) {
                if (options == null) { options = {}; }
                const $link = $viewport.find('.link');
                return up.follow($link, options);
              };

              const respond = linkDestination => {
                return this.respondWith(`\
  <div class="element" style="height: 300px">
    <a class="link" href="${linkDestination}" up-target=".element">Link</a>
  </div>\
  `
                );
              };

              up.replace('.element', '/foo');

              next(() => {
                // Provide the content at /foo with a link to /bar in the HTML
                return respond('/bar');
              });

              next(() => {
                $viewport.scrollTop(65);

                // Follow the link to /bar
                return followLink();
              });

              next(() => {
                // Provide the content at /bar with a link back to /foo in the HTML
                return respond('/foo');
              });

              next(() => {
                // Follow the link back to /foo, restoring the scroll position of 65px
                return followLink({restoreScroll: true});
              });
                // No need to respond because /foo has been cached before

              return next(() => {
                return expect($viewport.scrollTop()).toEqual(65);
              });
            })
            );
          });


          describe('revealing', function() {

            it('reaveals the target fragment', asyncSpec(function(next) {
              const $link = $fixture('a[href="/action"][up-target=".target"]');
              const $target = $fixture('.target');

              const revealStub = up.viewport.knife.mock('reveal');

              up.follow($link);

              next(() => {
                return this.respondWith('<div class="target">new text</div>');
              });

              return next(() => {
                expect(revealStub).toHaveBeenCalled();
                return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.target');
              });
            })
            );

            it('reveals the { failTarget } if the server responds with an error', asyncSpec(function(next) {
              const $link = $fixture('a[href="/action"][up-target=".target"][up-fail-target=".fail-target"]');
              const $target = $fixture('.target');
              const $failTarget = $fixture('.fail-target');

              const revealStub = up.viewport.knife.mock('reveal');

              up.follow($link);

              next(() => {
                return this.respondWith({
                  status: 500,
                  responseText: `\
  <div class="fail-target">
    Errors here
  </div>\
  `
                });
              });

              return next(() => {
                expect(revealStub).toHaveBeenCalled();
                return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.fail-target');
              });
            })
            );


            describe('with { reveal } option', function() {

              it('allows to reveal a different selector', asyncSpec(function(next) {
                const $link = $fixture('a[href="/action"][up-target=".target"]');
                const $target = $fixture('.target');
                const $other = $fixture('.other');

                const revealStub = up.viewport.knife.mock('reveal');

                up.follow($link, {reveal: '.other'});

                next(() => {
                  return this.respondWith(`\
  <div class="target">
    new text
  </div>
  <div class="other">
    new other
  </div>\
  `
                  );
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.other');
                });
              })
              );

              return it('still reveals the { failTarget } for a failed submission', asyncSpec(function(next) {
                const $link = $fixture('a[href="/action"][up-target=".target"][up-fail-target=".fail-target"]');
                const $target = $fixture('.target');
                const $failTarget = $fixture('.fail-target');
                const $other = $fixture('.other');

                const revealStub = up.viewport.knife.mock('reveal');

                up.follow($link, {reveal: '.other', failTarget: '.fail-target'});

                next(() => {
                  return this.respondWith({
                    status: 500,
                    responseText: `\
  <div class="fail-target">
    Errors here
  </div>\
  `
                  });
                });

                return next(() => {
                  expect(revealStub).toHaveBeenCalled();
                  return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.fail-target');
                });
              })
              );
            });

            describe('with { failReveal } option', () => it('reveals the given selector when the server responds with an error', asyncSpec(function(next) {
              const $link = $fixture('a[href="/action"][up-target=".target"][up-fail-target=".fail-target"]');
              const $target = $fixture('.target');
              const $failTarget = $fixture('.fail-target');
              const $other = $fixture('.other');
              const $failOther = $fixture('.fail-other');

              const revealStub = up.viewport.knife.mock('reveal');

              up.follow($link, {reveal: '.other', failReveal: '.fail-other'});

              next(() => {
                return this.respondWith({
                  status: 500,
                  responseText: `\
  <div class="fail-target">
  Errors here
  </div>
  <div class="fail-other">
  Fail other here
  </div>\
  `
                });
              });

              return next(() => {
                expect(revealStub).toHaveBeenCalled();
                return expect(revealStub.calls.mostRecent().args[0]).toMatchSelector('.fail-other');
              });
            })
            ));

            return describe("when the browser is already on the link's destination", function() {

              it("doesn't make a request and reveals the target container");

              return it("doesn't make a request and reveals the target of a #hash in the URL");
            });
          });

          return describe('with { confirm } option', function() {

            it('follows the link after the user OKs a confirmation dialog', asyncSpec(function(next) {
              spyOn(up, 'replace');
              spyOn(window, 'confirm').and.returnValue(true);
              const $link = $fixture('a[href="/danger"][up-target=".middle"]');
              up.follow($link, {confirm: 'Do you really want to go there?'});

              return next(() => {
                expect(window.confirm).toHaveBeenCalledWith('Do you really want to go there?');
                return expect(up.replace).toHaveBeenCalled();
              });
            })
            );

            it('does not follow the link if the user cancels the confirmation dialog', asyncSpec(function(next) {
              spyOn(up, 'replace');
              spyOn(window, 'confirm').and.returnValue(false);
              const $link = $fixture('a[href="/danger"][up-target=".middle"]');
              up.follow($link, {confirm: 'Do you really want to go there?'});

              return next(() => {
                expect(window.confirm).toHaveBeenCalledWith('Do you really want to go there?');
                return expect(up.replace).not.toHaveBeenCalled();
              });
            })
            );

            it('does not show a confirmation dialog if the option is not a present string', asyncSpec(function(next) {
              spyOn(up, 'replace');
              spyOn(window, 'confirm');
              const $link = $fixture('a[href="/danger"][up-target=".middle"]');
              up.follow($link, {confirm: ''});

              return next(() => {
                expect(window.confirm).not.toHaveBeenCalled();
                return expect(up.replace).toHaveBeenCalled();
              });
            })
            );

            return it('does not show a confirmation dialog when preloading', asyncSpec(function(next) {
              spyOn(up, 'replace');
              spyOn(window, 'confirm');
              const $link = $fixture('a[href="/danger"][up-target=".middle"]');
              up.follow($link, {confirm: 'Are you sure?', preload: true});

              return next(() => {
                expect(window.confirm).not.toHaveBeenCalled();
                return expect(up.replace).toHaveBeenCalled();
              });
            })
            );
          });
        });

        return describeFallback('canPushState', function() {

          it('navigates to the given link without JavaScript', asyncSpec(function(next) {
            const $link = $fixture('a[href="/path"]');
            spyOn(up.browser, 'navigate');
            up.follow($link);

            return next(() => {
              return expect(up.browser.navigate).toHaveBeenCalledWith('/path', jasmine.anything());
            });
          })
          );

          return it('uses the method from a data-method attribute', asyncSpec(function(next) {
            const $link = $fixture('a[href="/path"][data-method="PUT"]');
            spyOn(up.browser, 'navigate');
            up.follow($link);

            return next(() => {
              return expect(up.browser.navigate).toHaveBeenCalledWith('/path', { method: 'PUT' });
            });
          })
          );
        });
      });

      describe('up.link.shouldProcessEvent', function() {

        const buildEvent = function(target, attrs) {
          const event = Trigger.createMouseEvent('mousedown', attrs);
          // Cannot change event.target on a native event property, but we can with Object.defineProperty()
          Object.defineProperty(event, 'target', {get() { return target; }});
          return event;
        };

        it("returns true when the given event's target is the given link itself", function() {
          const $link = $fixture('a[href="/foo"]');
          const event = buildEvent($link[0]);
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(true);
        });

        it("returns true when the given event's target is a non-link child of the given link", function() {
          const $link = $fixture('a[href="/foo"]');
          const $span = $link.affix('span');
          const event = buildEvent($span[0]);
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(true);
        });

        it("returns false when the given event's target is a child link of the given link (think [up-expand])", function() {
          const $link = $fixture('div[up-href="/foo"]');
          const $childLink = $link.affix('a[href="/bar"]');
          const event = buildEvent($childLink[0]);
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });

        it("returns false when the given event's target is a child input of the given link (think [up-expand])", function() {
          const $link = $fixture('div[up-href="/foo"]');
          const $childInput = $link.affix('input[type="text"]');
          const event = buildEvent($childInput[0]);
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });

        it('returns false if the right mouse button is used', function() {
          const $link = $fixture('a[href="/foo"]');
          const event = buildEvent($link[0], {button: 2});
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });

        it('returns false if shift is pressed during the click', function() {
          const $link = $fixture('a[href="/foo"]');
          const event = buildEvent($link[0], {shiftKey: 2});
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });

        it('returns false if ctrl is pressed during the click', function() {
          const $link = $fixture('a[href="/foo"]');
          const event = buildEvent($link[0], {ctrlKey: 2});
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });

        return it('returns false if meta is pressed during the click', function() {
          const $link = $fixture('a[href="/foo"]');
          const event = buildEvent($link[0], {metaKey: 2});
          return expect(up.link.shouldProcessEvent(event, $link[0])).toBe(false);
        });
      });

      describe('up.link.makeFollowable', function() {

        it("adds [up-follow] to a link that wouldn't otherwise be handled by Unpoly", function() {
          const $link = $fixture('a[href="/path"]').text('label');
          up.link.makeFollowable($link[0]);
          return expect($link.attr('up-follow')).toEqual('');
        });

        it("does not add [up-follow] to a link that is already [up-target]", function() {
          const $link = $fixture('a[href="/path"][up-target=".target"]').text('label');
          up.link.makeFollowable($link[0]);
          return expect($link.attr('up-follow')).toBeMissing();
        });

        it("does not add [up-follow] to a link that is already [up-modal]", function() {
          const $link = $fixture('a[href="/path"][up-modal=".target"]').text('label');
          up.link.makeFollowable($link[0]);
          return expect($link.attr('up-follow')).toBeMissing();
        });

        return it("does not add [up-follow] to a link that is already [up-popup]", function() {
          const $link = $fixture('a[href="/path"][up-popup=".target"]').text('label');
          up.link.makeFollowable($link[0]);
          return expect($link.attr('up-follow')).toBeMissing();
        });
      });

      describe('up.visit', () => it('should have tests'));

      return describe('up.link.isFollowable', function() {

        it('returns true for an [up-target] link', function() {
          const $link = $fixture('a[href="/foo"][up-target=".target"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns true for an [up-follow] link', function() {
          const $link = $fixture('a[href="/foo"][up-follow]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns true for an [up-modal] link', function() {
          const $link = $fixture('a[href="/foo"][up-modal=".target"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns true for an [up-popup] link', function() {
          const $link = $fixture('a[href="/foo"][up-popup=".target"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns true for an [up-drawer] link', function() {
          const $link = $fixture('a[href="/foo"][up-drawer=".target"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns true for an [up-target] span with [up-href]', function() {
          const $link = $fixture('span[up-href="/foo"][up-target=".target"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(true);
        });

        it('returns false if the given link will be handled by the browser', function() {
          const $link = $fixture('a[href="/foo"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(false);
        });

        return it('returns false if the given link will be handled by Rails UJS', function() {
          const $link = $fixture('a[href="/foo"][data-method="put"]');
          up.hello($link);
          return expect(up.link.isFollowable($link)).toBe(false);
        });
      });
    });

    return describe('unobtrusive behavior', function() {

      describe('a[up-target]', function() {

        it('does not follow a form with up-target attribute (bugfix)', asyncSpec(function(next) {
          const $form = $fixture('form[up-target]');
          up.hello($form);
          const followSpy = up.link.knife.mock('defaultFollow').and.returnValue(Promise.resolve());
          Trigger.clickSequence($form);

          return next(() => {
            return expect(followSpy).not.toHaveBeenCalled();
          });
        })
        );

        describeCapability('canPushState', function() {

          it('requests the [href] with AJAX and replaces the [up-target] selector', asyncSpec(function(next) {
            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"]');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith('<div class="target">new text</div>');
            });

            return next(() => {
              return expect($('.target')).toHaveText('new text');
            });
          })
          );


          it('adds a history entry', asyncSpec(function(next) {
            up.history.config.enabled = true;

            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"]');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith('<div class="target">new text</div>');
            });

            return next(() => {
              expect($('.target')).toHaveText('new text');
              return expect(location.pathname).toEqual('/path');
            });
          })
          );

          it('respects a X-Up-Location header that the server sends in case of a redirect', asyncSpec(function(next) {
            up.history.config.enabled = true;

            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"]');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith({
                responseText: '<div class="target">new text</div>',
                responseHeaders: { 'X-Up-Location': '/other/path' }});
          });

            return next(() => {
              expect($('.target')).toHaveText('new text');
              return expect(location.pathname).toEqual('/other/path');
            });
          })
          );

          describe('choice of target layer', function() {

            beforeEach(() => up.motion.config.enabled = false);

            it('prefers to update a container in the same layer as the clicked link', asyncSpec(function(next) {
              $fixture('.document').affix('.target').text('old document text');
              up.modal.extract('.target', "<div class='target'>old modal text</div>");

              next(() => {
                expect($('.document .target')).toHaveText('old document text');
                expect($('.up-modal .target')).toHaveText('old modal text');

                const $linkInModal = $('.up-modal').affix('a[href="/bar"][up-target=".target"]');
                return Trigger.clickSequence($linkInModal);
              });

              next(() => {
                return this.respondWith('<div class="target">new text from modal link</div>');
              });

              return next(() => {
                expect($('.document .target')).toHaveText('old document text');
                return expect($('.up-modal .target')).toHaveText('new text from modal link');
              });
            })
            );

            return describe('with [up-layer] modifier', function() {

              it('allows to name a layer for the update', asyncSpec(function(next) {
                $fixture('.document').affix('.target').text('old document text');
                up.modal.extract('.target', "<div class='target'>old modal text</div>", {sticky: true});

                next(() => {
                  expect($('.document .target')).toHaveText('old document text');
                  expect($('.up-modal .target')).toHaveText('old modal text');

                  const $linkInModal = $('.up-modal').affix('a[href="/bar"][up-target=".target"][up-layer="page"]');
                  return Trigger.clickSequence($linkInModal);
                });

                next(() => {
                  return this.respondWith('<div class="target">new text from modal link</div>');
                });

                return next(() => {
                  expect($('.document .target')).toHaveText('new text from modal link');
                  return expect($('.up-modal .target')).toHaveText('old modal text');
                });
              })
              );

              it('ignores [up-layer] if the server responds with an error', asyncSpec(function(next) {
                $fixture('.document').affix('.target').text('old document text');
                up.modal.extract('.target', "<div class='target'>old modal text</div>", {sticky: true});

                next(() => {
                  expect($('.document .target')).toHaveText('old document text');
                  expect($('.up-modal .target')).toHaveText('old modal text');

                  const $linkInModal = $('.up-modal').affix('a[href="/bar"][up-target=".target"][up-fail-target=".target"][up-layer="page"]');
                  return Trigger.clickSequence($linkInModal);
                });

                next(() => {
                  return this.respondWith({
                    responseText: '<div class="target">new failure text from modal link</div>',
                    status: 500
                  });
                });

                return next(() => {
                  expect($('.document .target')).toHaveText('old document text');
                  return expect($('.up-modal .target')).toHaveText('new failure text from modal link');
                });
              })
              );

              return it('allows to name a layer for a non-200 response using an [up-fail-layer] modifier', asyncSpec(function(next) {
                $fixture('.document').affix('.target').text('old document text');
                up.modal.extract('.target', "<div class='target'>old modal text</div>", {sticky: true});

                next(() => {
                  expect($('.document .target')).toHaveText('old document text');
                  expect($('.up-modal .target')).toHaveText('old modal text');

                  const $linkInModal = $('.up-modal').affix('a[href="/bar"][up-target=".target"][up-fail-target=".target"][up-fail-layer="page"]');
                  return Trigger.clickSequence($linkInModal);
                });

                next(() => {
                  return this.respondWith({
                    responseText: '<div class="target">new failure text from modal link</div>',
                    status: 500
                  });
                });

                return next(() => {
                  expect($('.document .target')).toHaveText('new failure text from modal link');
                  return expect($('.up-modal .target')).toHaveText('old modal text');
                });
              })
              );
            });
          });

          describe('with [up-fail-target] modifier', function() {

            beforeEach(function() {
              $fixture('.success-target').text('old success text');
              $fixture('.failure-target').text('old failure text');
              return this.$link = $fixture('a[href="/path"][up-target=".success-target"][up-fail-target=".failure-target"]');
            });

            it('uses the [up-fail-target] selector for a failed response', asyncSpec(function(next) {
              Trigger.clickSequence(this.$link);

              next(() => {
                return this.respondWith('<div class="failure-target">new failure text</div>', {status: 500});
              });

              return next(() => {
                expect($('.success-target')).toHaveText('old success text');
                expect($('.failure-target')).toHaveText('new failure text');

                // Since there isn't anyone who could handle the rejection inside
                // the event handler, our handler mutes the rejection.
                if (REJECTION_EVENTS_SUPPORTED) { return expect(window).not.toHaveUnhandledRejections(); }
              });
            })
            );


            return it('uses the [up-target] selector for a successful response', asyncSpec(function(next) {
              Trigger.clickSequence(this.$link);

              next(() => {
                return this.respondWith('<div class="success-target">new success text</div>', {status: 200});
              });

              return next(() => {
                expect($('.success-target')).toHaveText('new success text');
                return expect($('.failure-target')).toHaveText('old failure text');
              });
            })
            );
          });

          describe('with [up-transition] modifier', () => it('morphs between the old and new target element', asyncSpec(function(next) {
            $fixture('.target.old');
            const $link = $fixture('a[href="/path"][up-target=".target"][up-transition="cross-fade"][up-duration="500"][up-easing="linear"]');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith('<div class="target new">new text</div>');
            });

            next(() => {
              this.$oldGhost = $('.target.old');
              this.$newGhost = $('.target.new');
              expect(this.$oldGhost).toBeAttached();
              expect(this.$newGhost).toBeAttached();
              expect(this.$oldGhost).toHaveOpacity(1, 0.15);
              return expect(this.$newGhost).toHaveOpacity(0, 0.15);
            });

            return next.after(250, () => {
              expect(this.$oldGhost).toHaveOpacity(0.5, 0.15);
              return expect(this.$newGhost).toHaveOpacity(0.5, 0.15);
            });
          })
          ));

          return describe('wih a CSS selector in the [up-fallback] attribute', function() {

            it('uses the fallback selector if the [up-target] CSS does not exist on the page', asyncSpec(function(next) {
              $fixture('.fallback').text('old fallback');
              const $link = $fixture('a[href="/path"][up-target=".target"][up-fallback=".fallback"]');
              Trigger.clickSequence($link);

              next(() => {
                return this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );
              });

              return next(() => {
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            return it('ignores the fallback selector if the [up-target] CSS exists on the page', asyncSpec(function(next) {
              $fixture('.target').text('old target');
              $fixture('.fallback').text('old fallback');
              const $link = $fixture('a[href="/path"][up-target=".target"][up-fallback=".fallback"]');
              Trigger.clickSequence($link);

              next(() => {
                return this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );
              });

              return next(() => {
                expect('.target').toHaveText('new target');
                return expect('.fallback').toHaveText('old fallback');
              });
            })
            );
          });
        });

        return it('does not add a history entry when an up-history attribute is set to "false"', asyncSpec(function(next) {
          up.history.config.enabled = true;

          const oldPathname = location.pathname;
          $fixture('.target');
          const $link = $fixture('a[href="/path"][up-target=".target"][up-history="false"]');
          Trigger.clickSequence($link);

          next(() => {
            return this.respondWith({
              responseText: '<div class="target">new text</div>',
              responseHeaders: { 'X-Up-Location': '/other/path' }});
        });

          return next(() => {
            expect($('.target')).toHaveText('new text');
            return expect(location.pathname).toEqual(oldPathname);
          });
        })
        );
      });

      describe('a[up-follow]', function() {

        beforeEach(function() {
          this.$link = $fixture('a[href="/follow-path"][up-follow]');
          this.followSpy = up.link.knife.mock('defaultFollow').and.returnValue(Promise.resolve());
          return this.defaultSpy = spyOn(up.link, 'allowDefault').and.callFake(event => event.preventDefault());
        });

        it("calls up.follow with the clicked link", asyncSpec(function(next) {
          Trigger.click(this.$link);
          return next(() => {
            return expect(this.followSpy).toHaveBeenCalledWith(this.$link[0], {});
          });
        })
        );

        // IE does not call JavaScript and always performs the default action on right clicks
        if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
          it('does nothing if the right mouse button is used', asyncSpec(function(next) {
            Trigger.click(this.$link, {button: 2});
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );
        }

        it('does nothing if shift is pressed during the click', asyncSpec(function(next) {
          Trigger.click(this.$link, {shiftKey: true});
          return next(() => expect(this.followSpy).not.toHaveBeenCalled());
        })
        );

        it('does nothing if ctrl is pressed during the click', asyncSpec(function(next){
          Trigger.click(this.$link, {ctrlKey: true});
          return next(() => expect(this.followSpy).not.toHaveBeenCalled());
        })
        );

        it('does nothing if meta is pressed during the click', asyncSpec(function(next){
          Trigger.click(this.$link, {metaKey: true});
          return next(() => expect(this.followSpy).not.toHaveBeenCalled());
        })
        );

        return describe('with [up-instant] modifier', function() {

          beforeEach(function() {
            return this.$link.attr('up-instant', '');
          });

          it('follows a link on mousedown (instead of on click)', asyncSpec(function(next){
            Trigger.mousedown(this.$link);
            return next(() => expect(this.followSpy.calls.mostRecent().args[0]).toEqual(this.$link[0]));
          })
          );

          it('does nothing on mouseup', asyncSpec(function(next){
            Trigger.mouseup(this.$link);
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          it('does nothing on click', asyncSpec(function(next){
            Trigger.click(this.$link);
            return next(() => expect(this.followSpy).not.toHaveBeenCalled());
          })
          );

          // IE does not call JavaScript and always performs the default action on right clicks
          if (!AgentDetector.isIE() && !AgentDetector.isEdge()) {
            it('does nothing if the right mouse button is pressed down', asyncSpec(function(next){
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
      });

      describe('[up-dash]', function() {

        it("is a shortcut for [up-preload], [up-instant] and [up-target], using [up-dash]'s value as [up-target]", function() {
          const $link = $fixture('a[href="/path"][up-dash=".target"]').text('label');
          up.hello($link);
          expect($link.attr('up-preload')).toEqual('');
          expect($link.attr('up-instant')).toEqual('');
          return expect($link.attr('up-target')).toEqual('.target');
        });

        it("adds [up-follow] attribute if [up-dash]'s value is 'true'", function() {
          const $link = $fixture('a[href="/path"][up-dash="true"]').text('label');
          up.hello($link);
          return expect($link.attr('up-follow')).toEqual('');
        });

        it("adds [up-follow] attribute if [up-dash] is present, but has no value", function() {
          const $link = $fixture('a[href="/path"][up-dash]').text('label');
          up.hello($link);
          return expect($link.attr('up-follow')).toEqual('');
        });

        it("does not add an [up-follow] attribute if [up-dash] is 'true', but [up-target] is present", function() {
          const $link = $fixture('a[href="/path"][up-dash="true"][up-target=".target"]').text('label');
          up.hello($link);
          expect($link.attr('up-follow')).toBeMissing();
          return expect($link.attr('up-target')).toEqual('.target');
        });

        it("does not add an [up-follow] attribute if [up-dash] is 'true', but [up-modal] is present", function() {
          const $link = $fixture('a[href="/path"][up-dash="true"][up-modal=".target"]').text('label');
          up.hello($link);
          expect($link.attr('up-follow')).toBeMissing();
          return expect($link.attr('up-modal')).toEqual('.target');
        });

        it("does not add an [up-follow] attribute if [up-dash] is 'true', but [up-popup] is present", function() {
          const $link = $fixture('a[href="/path"][up-dash="true"][up-popup=".target"]').text('label');
          up.hello($link);
          expect($link.attr('up-follow')).toBeMissing();
          return expect($link.attr('up-popup')).toEqual('.target');
        });

        return it("removes the [up-dash] attribute when it's done", function() {
          const $link = $fixture('a[href="/path"]').text('label');
          up.hello($link);
          return expect($link.attr('up-dash')).toBeMissing();
        });
      });

      return describe('[up-expand]', function() {

        it('copies up-related attributes of a contained link', function() {
          const $area = $fixture('div[up-expand] a[href="/path"][up-target="selector"][up-instant][up-preload]');
          up.hello($area);
          expect($area.attr('up-target')).toEqual('selector');
          expect($area.attr('up-instant')).toEqual('');
          return expect($area.attr('up-preload')).toEqual('');
        });

        it("renames a contained link's href attribute to up-href so the container is considered a link", function() {
          const $area = $fixture('div[up-expand] a[up-follow][href="/path"]');
          up.hello($area);
          return expect($area.attr('up-href')).toEqual('/path');
        });

        it('copies attributes from the first link if there are multiple links', function() {
          const $area = $fixture('div[up-expand]');
          const $link1 = $area.affix('a[href="/path1"]');
          const $link2 = $area.affix('a[href="/path2"]');
          up.hello($area);
          return expect($area.attr('up-href')).toEqual('/path1');
        });

        it("copies an contained non-link element with up-href attribute", function() {
          const $area = $fixture('div[up-expand] span[up-follow][up-href="/path"]');
          up.hello($area);
          return expect($area.attr('up-href')).toEqual('/path');
        });

        it('adds an up-follow attribute if the contained link has neither up-follow nor up-target attributes', function() {
          const $area = $fixture('div[up-expand] a[href="/path"]');
          up.hello($area);
          return expect($area.attr('up-follow')).toEqual('');
        });

        it('can be used to enlarge the click area of a link', asyncSpec(function(next) {
          const $area = $fixture('div[up-expand] a[href="/path"]');
          up.hello($area);
          spyOn(up, 'replace');
          Trigger.clickSequence($area);
          return next(() => {
            return expect(up.replace).toHaveBeenCalled();
          });
        })
        );

        it('does nothing when the user clicks another link in the expanded area', asyncSpec(function(next) {
          const $area = $fixture('div[up-expand]');
          const $expandedLink = $area.affix('a[href="/expanded-path"][up-follow]');
          const $otherLink = $area.affix('a[href="/other-path"][up-follow]');
          up.hello($area);
          const followSpy = up.link.knife.mock('defaultFollow').and.returnValue(Promise.resolve());
          Trigger.clickSequence($otherLink);
          return next(() => {
            expect(followSpy.calls.count()).toEqual(1);
            return expect(followSpy.calls.mostRecent().args[0]).toEqual($otherLink[0]);
          });
        })
        );

        it('does nothing when the user clicks on an input in the expanded area', asyncSpec(function(next) {
          const $area = $fixture('div[up-expand]');
          const $expandedLink = $area.affix('a[href="/expanded-path"][up-follow]');
          const $input = $area.affix('input[type=text]');
          up.hello($area);
          const followSpy = up.link.knife.mock('defaultFollow').and.returnValue(Promise.resolve());
          Trigger.clickSequence($input);
          return next(() => {
            return expect(followSpy).not.toHaveBeenCalled();
          });
        })
        );

        it('does not trigger multiple replaces when the user clicks on the expanded area of an [up-instant] link (bugfix)', asyncSpec(function(next) {
          const $area = $fixture('div[up-expand] a[href="/path"][up-follow][up-instant]');
          up.hello($area);
          spyOn(up, 'replace');
          Trigger.clickSequence($area);
          return next(() => {
            return expect(up.replace.calls.count()).toEqual(1);
          });
        })
        );

        it('does not add an up-follow attribute if the expanded link is [up-dash] with a selector (bugfix)', function() {
          const $area = $fixture('div[up-expand] a[href="/path"][up-dash=".element"]');
          up.hello($area);
          return expect($area.attr('up-follow')).toBeMissing();
        });

        it('does not an up-follow attribute if the expanded link is [up-dash] without a selector (bugfix)', function() {
          const $area = $fixture('div[up-expand] a[href="/path"][up-dash]');
          up.hello($area);
          return expect($area.attr('up-follow')).toEqual('');
        });

        return describe('with a CSS selector in the property value', function() {

          it("expands the contained link that matches the selector", function() {
            const $area = $fixture('div[up-expand=".second"]');
            const $link1 = $area.affix('a.first[href="/path1"]');
            const $link2 = $area.affix('a.second[href="/path2"]');
            up.hello($area);
            return expect($area.attr('up-href')).toEqual('/path2');
          });

          it('does nothing if no contained link matches the selector', function() {
            const $area = $fixture('div[up-expand=".foo"]');
            const $link = $area.affix('a[href="/path1"]');
            up.hello($area);
            return expect($area.attr('up-href')).toBeUndefined();
          });

          return it('does not match an element that is not a descendant', function() {
            const $area = $fixture('div[up-expand=".second"]');
            const $link1 = $area.affix('a.first[href="/path1"]');
            const $link2 = $fixture('a.second[href="/path2"]'); // not a child of $area
            up.hello($area);
            return expect($area.attr('up-href')).toBeUndefined();
          });
        });
      });
    });
  });
})();