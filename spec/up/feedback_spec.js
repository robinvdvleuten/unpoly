/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.feedback', function() {

    beforeEach(function() {
      up.history.config.enabled = true;
      up.modal.config.openAnimation = 'none';
      up.modal.config.closeAnimation = 'none';
      up.popup.config.openAnimation = 'none';
      return up.popup.config.closeAnimation = 'none';
    });

    return describe('unobtrusive behavior', function() {

      describe('[up-nav]', function() {

        it('marks a child link as .up-current if it links to the current URL', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/foo"]');
          const $otherLink = $nav.affix('a[href="/bar"]');
          up.hello($nav);
          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        it('marks the element as .up-current if it is also a link to the current URL', function() {
          up.history.replace('/foo');
          const $currentLink = $fixture('a[href="/foo"][up-nav]');
          const $otherLink = $fixture('a[href="/bar"][up-nav]');
          up.hello($currentLink);
          up.hello($otherLink);
          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        it('does not mark a link as .up-current if the link is outside an [up-nav]', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLinkInNav = $nav.affix('a[href="/foo"]');
          const $currentLinkOutsideNav = $fixture('a[href="/foo"]');
          up.hello($nav);
          expect($currentLinkInNav).toHaveClass('up-current');
          return expect($currentLinkOutsideNav).not.toHaveClass('up-current');
        });

        it('marks a replaced child link as .up-current if it links to the current URL', asyncSpec(function(next) {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          $nav.affix('a.link[href="/bar"]').text('old link');
          up.hello($nav);

          expect('.link').toHaveText('old link');
          expect('.link').not.toHaveClass('up-current');

          up.replace('.link', '/src', {history: false});

          next(() => {
            return this.respondWith(`\
  <a class="link" href="/foo">
    new link
  </a>\
  `
            );
          });

          return next(() => {
            expect('.link').toHaveText('new link');
            return expect('.link').toHaveClass('up-current');
          });
        })
        );

        it('marks any link as .up-current if its up-href attribute matches the current URL', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('span[up-href="/foo"]');
          const $otherLink = $nav.affix('span[up-href="/bar"]');
          up.hello($nav);
          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        it('matches the current and destination URLs if they only differ by a trailing slash', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('span[up-href="/foo/"]');
          up.hello($nav);
          return expect($currentLink).toHaveClass('up-current');
        });

        it('does not match the current and destination URLs if they differ in the search', function() {
          up.history.replace('/foo?q=1');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('span[up-href="/foo?q=2"]');
          up.hello($nav);
          return expect($currentLink).not.toHaveClass('up-current');
        });

        it('marks any link as .up-current if any of its space-separated up-alias values matches the current URL', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/x"][up-alias="/aaa /foo /bbb"]');
          const $otherLink = $nav.affix('a[href="/y"][up-alias="/bar"]');
          up.hello($nav);
          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        it('does not throw if the current location does not match an up-alias wildcard (bugfix)', function() {
          const inserter = () => up.hello(fixture('a[up-nav][up-alias="/qqqq*"]'));
          return expect(inserter).not.toThrow();
        });

        it('does not highlight a link to "#" (commonly used for JS-only buttons)', function() {
          const $nav = $fixture('div[up-nav]');
          const $link = $nav.affix('a[href="#"]');
          up.hello($nav);
          return expect($link).not.toHaveClass('up-current');
        });

        it('does not highlight links with unsafe methods', function() {
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $defaultLink = $nav.affix('a[href="/foo"]');
          const $getLink = $nav.affix('a[href="/foo"][up-method="get"]');
          const $putLink = $nav.affix('a[href="/foo"][up-method="put"]');
          const $patchLink = $nav.affix('a[href="/foo"][up-method="patch"]');
          const $postLink = $nav.affix('a[href="/foo"][up-method="post"]');
          const $deleteLink = $nav.affix('a[href="/foo"][up-method="delete"]');
          up.hello($nav);

          expect($defaultLink).toHaveClass('up-current');
          expect($getLink).toHaveClass('up-current');
          expect($putLink).not.toHaveClass('up-current');
          expect($patchLink).not.toHaveClass('up-current');
          expect($postLink).not.toHaveClass('up-current');
          return expect($deleteLink).not.toHaveClass('up-current');
        });

        it('marks URL prefixes as .up-current if an up-alias value ends in *', function() {
          up.history.replace('/foo/123');

          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/x"][up-alias="/aaa /foo/* /bbb"]');
          const $otherLink = $nav.affix('a[href="/y"][up-alias="/bar"]');
          up.hello($nav);

          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        it('marks URL prefixes as .up-current if an up-alias has multiple * placeholders', function() {
          up.history.replace('/a-foo-b-bar-c');

          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/x"][up-alias="*-foo-*-bar-*"]');
          const $otherLink1 = $nav.affix('a[href="/y"][up-alias="/foo-bar"]');
          const $otherLink2 = $nav.affix('a[href="/y"][up-alias="/foo-b-bar"]');
          const $otherLink3 = $nav.affix('a[href="/y"][up-alias="/a-foo-b-bar"]');
          const $otherLink4 = $nav.affix('a[href="/y"][up-alias="/foo-b-bar-c"]');
          const $otherLink5 = $nav.affix('a[href="/y"][up-alias="/a-foo-b-bar-c-d"]');
          up.hello($nav);

          expect($currentLink).toHaveClass('up-current');
          expect($otherLink1).not.toHaveClass('up-current');
          expect($otherLink2).not.toHaveClass('up-current');
          expect($otherLink3).not.toHaveClass('up-current');
          expect($otherLink4).not.toHaveClass('up-current');
          return expect($otherLink5).not.toHaveClass('up-current');
        });


        it('allows to configure a custom "current" class in addition to .up-current', function() {
          up.feedback.config.currentClasses.push('highlight');
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/foo"]');
          up.hello($nav);

          expect($currentLink).toHaveClass('highlight');
          return expect($currentLink).toHaveClass('up-current');
        });

        it('allows to configure multiple additional "current" classes', function() {
          up.feedback.config.currentClasses.push('highlight1');
          up.feedback.config.currentClasses.push('highlight2');
          up.history.replace('/foo');
          const $nav = $fixture('div[up-nav]');
          const $currentLink = $nav.affix('a[href="/foo"]');
          up.hello($nav);

          expect($currentLink).toHaveClass('highlight1');
          expect($currentLink).toHaveClass('highlight2');
          return expect($currentLink).toHaveClass('up-current');
        });

        it('allows to configure additional nav selectors', function() {
          up.history.replace('/foo');
          up.feedback.config.navs.push('.navi');
          const $nav = $fixture('div.navi');
          const $currentLink = $nav.affix('a[href="/foo"]');
          const $otherLink = $nav.affix('a[href="/bar"]');
          up.hello($nav);
          expect($currentLink).toHaveClass('up-current');
          return expect($otherLink).not.toHaveClass('up-current');
        });

        return describeCapability('canPushState', () => describe('updating .up-current marks wen the URL changes', function() {

          it('marks a link as .up-current if it links to the current URL, but is missing a trailing slash', asyncSpec(function(next) {
            const $nav = $fixture('div[up-nav]');
            const $link = $nav.affix('a[href="/foo"][up-target=".main"]');
            up.hello($nav);

            fixture('.main');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith({
                responseHeaders: { 'X-Up-Location': '/foo/' },
                responseText: '<div class="main">new-text</div>'
              });
            });

            return next(() => {
              return expect($link).toHaveClass('up-current');
            });
          })
          );

          it('marks a link as .up-current if it links to the current URL, but has an extra trailing slash', asyncSpec(function(next) {
            const $nav = $fixture('div[up-nav]');
            const $link = $nav.affix('a[href="/foo/"][up-target=".main"]');
            up.hello($nav);

            fixture('.main');
            Trigger.clickSequence($link);

            next(() => {
              return this.respondWith({
                responseHeaders: { 'X-Up-Location': '/foo' },
                responseText: '<div class="main">new-text</div>'
              });
            });

            return next(() => {
              return expect($link).toHaveClass('up-current');
            });
          })
          );

          it('marks a link as .up-current if it links to an URL currently shown either within or below the modal', asyncSpec(function(next) {
            up.history.replace('/foo');

            const $nav = $fixture('div[up-nav]');
            const $backgroundLink = $nav.affix('a[href="/foo"]');
            const $modalLink = $nav.affix('a[href="/bar"][up-modal=".main"]');
            const $unrelatedLink = $nav.affix('a[href="/baz"]');
            up.hello($nav);

            Trigger.clickSequence($modalLink);

            next(() => {
              return this.respondWith('<div class="main">new-text</div>');
            });

            next(() => {
              expect($backgroundLink).toHaveClass('up-current');
              expect($modalLink).toHaveClass('up-current');
              expect($unrelatedLink).not.toHaveClass('up-current');
              return next.await(up.modal.close());
            });

            return next(() => {
              expect($backgroundLink).toHaveClass('up-current');
              expect($modalLink).not.toHaveClass('up-current');
              return expect($unrelatedLink).not.toHaveClass('up-current');
            });
          })
          );

          it("marks a link as .up-current if it links to the URL currently either within or below the popup, even if the popup doesn't change history", asyncSpec(function(next) {
            up.history.replace('/foo');

            // This is actually the default. Popups don't change the address bar by default,
            // but we still want to cause their URL to mark links as current.
            up.popup.config.history = false;

            const $nav = $fixture('div[up-nav]');
            const $backgroundLink = $nav.affix('a[href="/foo"]');
            const $popupLink = $nav.affix('a[href="/bar"][up-popup=".main"]');
            const $unrelatedLink = $nav.affix('a[href="/baz"]');
            up.hello($nav);

            expect(up.browser.url()).toMatchUrl('/foo');
            expect(up.popup.coveredUrl()).toBeMissing();

            next(() => {
              return Trigger.clickSequence($popupLink);
            });

            next(() => {
              return this.respondWith('<div class="main">new-text</div>');
            });

            next(() => {
              expect(up.browser.url()).toMatchUrl('/foo'); // popup did not change history
              expect(up.popup.url()).toMatchUrl('/bar'); // popup still knows which URL it is displaying
              expect($backgroundLink).toHaveClass('up-current');
              expect($popupLink).toHaveClass('up-current');
              expect($unrelatedLink).not.toHaveClass('up-current');

              return next.await(up.popup.close());
            });

            return next(() => {
              expect($backgroundLink).toHaveClass('up-current');
              expect($popupLink).not.toHaveClass('up-current');
              return expect($unrelatedLink).not.toHaveClass('up-current');
            });
          })
          );

          return it("respects links that are added to an existing [up-nav] by a fragment update", asyncSpec(function(next) {
            const $nav = $fixture('.nav[up-nav]');
            const $link = $nav.affix('a[href="/foo"][up-target=".main"]');
            const $more = $nav.affix('.more');
            up.hello($nav);

            up.extract('.more', '<div class="more"><a href="/bar"></div>', {history: '/bar'});

            return next(() => {
              const $moreLink = $('.more').find('a');
              expect($moreLink).toBeAttached();
              return expect($moreLink).toHaveClass('up-current');
            });
          })
          );
        }));
      });


      return describe('.up-active', () => describeCapability('canPushState', function() {

        it('marks clicked links as .up-active until the request finishes', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-target=".main"]');
          fixture('.main');
          Trigger.clickSequence($link);

          next(() => {
            expect($link).toHaveClass('up-active');
            return this.respondWith('<div class="main">new-text</div>');
          });

          return next(() => {
            return expect($link).not.toHaveClass('up-active');
          });
        })
        );

        it('does not mark a link as .up-active while it is preloading', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-target=".main"]');
          fixture('.main');

          up.proxy.preload($link);

          return next(() => {
            expect(jasmine.Ajax.requests.count()).toEqual(1);
            return expect($link).not.toHaveClass('up-active');
          });
        })
        );

        it('marks links with [up-instant] on mousedown as .up-active until the request finishes', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-instant][up-target=".main"]');
          fixture('.main');
          Trigger.mousedown($link);

          next(() => expect($link).toHaveClass('up-active'));
          next(() => this.respondWith('<div class="main">new-text</div>'));
          return next(() => expect($link).not.toHaveClass('up-active'));
        })
        );

        it('prefers to mark an enclosing [up-expand] click area', asyncSpec(function(next) {
          const $area = $fixture('div[up-expand] a[href="/foo"][up-target=".main"]');
          up.hello($area);
          const $link = $area.find('a');
          fixture('.main');
          Trigger.clickSequence($link);

          next(() => {
            expect($link).not.toHaveClass('up-active');
            return expect($area).toHaveClass('up-active');
          });
          next(() => {
            return this.respondWith('<div class="main">new-text</div>');
          });
          return next(() => {
            return expect($area).not.toHaveClass('up-active');
          });
        })
        );

        it('removes .up-active when a link with [up-confirm] was not confirmed', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-modal=".main"][up-confirm="Really follow?"]');
          spyOn(up.browser, 'whenConfirmed').and.returnValue(Promise.reject('User aborted'));

          Trigger.clickSequence($link);

          return next(() => {
            return expect($link).not.toHaveClass('up-active');
          });
        })
        );

        it('marks clicked modal openers as .up-active while the modal is loading', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-modal=".main"]');
          fixture('.main');
          Trigger.clickSequence($link);

          next(() => expect($link).toHaveClass('up-active'));
          next(() => this.respondWith('<div class="main">new-text</div>'));
          return next(() => expect($link).not.toHaveClass('up-active'));
        })
        );

        it('removes .up-active from a clicked modal opener if the target is already preloaded (bugfix)', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-modal=".main"]');
          up.proxy.preload($link);

          next(() => this.respondWith('<div class="main">new-text</div>'));
          next(() => Trigger.clickSequence($link));
          return next(() => {
            expect('.up-modal .main').toHaveText('new-text');
            return expect($link).not.toHaveClass('up-active');
          });
        })
        );

        it('removes .up-active from a clicked link if the target is already preloaded (bugfix)', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-target=".main"]');
          fixture('.main');
          up.proxy.preload($link);

          next(() => this.respondWith('<div class="main">new-text</div>'));
          next(() => Trigger.clickSequence($link));
          return next(() => {
            expect('.main').toHaveText('new-text');
            return expect($link).not.toHaveClass('up-active');
          });
        })
        );

        return it('removes .up-active from a clicked link if the request fails (bugfix)', asyncSpec(function(next) {
          const $link = $fixture('a[href="/foo"][up-target=".main"]');
          fixture('.main');
          Trigger.clickSequence($link);

          return next(() => {
            return expect($link).toHaveClass('up-active');
          });
        })
        );
      }));
    });
  });
  //            @respondWith
  //              responseText: '<div class="main">failed</div>'
  //              status: 400
  //
  //          next =>
  //            expect($link).not.toHaveClass('up-active')
})();