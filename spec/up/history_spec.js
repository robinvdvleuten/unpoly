/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.history', function() {

    beforeEach(() => up.history.config.enabled = true);
    
    describe('JavaScript functions', function() {
      
      describe('up.history.replace', () => it('should have tests'));

      describe('up.history.url', () => describeCapability('canPushState', () => it('does not strip a trailing slash from the current URL', function() {
        if (typeof history.replaceState === 'function') {
          history.replaceState({}, 'title', '/host/path/');
        }
        return expect(up.history.url()).toMatchUrl('/host/path/');
      })));

      return describe('up.history.isUrl', () => describeCapability('canPushState', function() {

        it('returns true if the given path is the current URL', function() {
          if (typeof history.replaceState === 'function') {
            history.replaceState({}, 'title', '/host/path/');
          }
          return expect(up.history.isUrl('/host/path/')).toBe(true);
        });

        it('returns false if the given path is not the current URL', function() {
          if (typeof history.replaceState === 'function') {
            history.replaceState({}, 'title', '/host/path/');
          }
          return expect(up.history.isUrl('/host/other-path/')).toBe(false);
        });

        it('returns true if the given full URL is the current URL', function() {
          if (typeof history.replaceState === 'function') {
            history.replaceState({}, 'title', '/host/path/');
          }
          return expect(up.history.isUrl(`http://${location.host}/host/path/`)).toBe(true);
        });

        it('returns true if the given path is the current URL, but without a trailing slash', function() {
          if (typeof history.replaceState === 'function') {
            history.replaceState({}, 'title', '/host/path/');
          }
          return expect(up.history.isUrl('/host/path')).toBe(true);
        });

        return it('returns true if the given path is the current URL, but with a trailing slash', function() {
          if (typeof history.replaceState === 'function') {
            history.replaceState({}, 'title', '/host/path');
          }
          return expect(up.history.isUrl('/host/path/')).toBe(true);
        });
      }));
    });

    return describe('unobtrusive behavior', function() {

      describe('back button', () => it('calls destructor functions when destroying compiled elements (bugfix)', asyncSpec(function(next) {
        const waitForBrowser = 70;

        // By default, up.history will replace the <body> tag when
        // the user presses the back-button. We reconfigure this
        // so we don't lose the Jasmine runner interface.
        up.history.config.popTargets = ['.container'];

        const constructorSpy = jasmine.createSpy('constructor');
        const destructorSpy = jasmine.createSpy('destructor');

        up.$compiler('.example', function($example) {
          constructorSpy();
          return destructorSpy;
        });

        up.history.push('/one');
        up.history.push('/two');

        const $container = $fixture('.container');
        const $example = $container.affix('.example');
        up.hello($example);

        expect(constructorSpy).toHaveBeenCalled();

        history.back();

        next.after(waitForBrowser, () => {
          expect(location.pathname).toEqual('/one');
          return this.respondWith("<div class='container'>restored container text</div>");
        });

        return next(() => {
          return expect(destructorSpy).toHaveBeenCalled();
        });
      })
      ));


      describe('[up-back]', function() {

        describeCapability('canPushState', () => it('sets an [up-href] attribute to the previous URL and sets the up-restore-scroll attribute to "true"', function() {
          up.history.push('/path1');
          up.history.push('/path2');
          const element = up.hello($fixture('a[href="/path3"][up-back]').text('text'));
          const $element = $(element);
          expect($element.attr('href')).toMatchUrl('/path3');
          expect($element.attr('up-href')).toMatchUrl('/path1');
          expect($element.attr('up-restore-scroll')).toBe('');
          return expect($element.attr('up-follow')).toBe('');
        }));

        it('does not overwrite an existing up-href or up-restore-scroll attribute');

        it('does not set an up-href attribute if there is no previous URL');

        return describeFallback('canPushState', () => it('does not change the element', function() {
          const $element = $(up.hello($fixture('a[href="/three"][up-back]').text('text')));
          return expect($element.attr('up-href')).toBeUndefined();
        }));
      });

      describe('scroll restoration', () => describeCapability('canPushState', function() {

        afterEach(() => $('.viewport').remove());

        it('restores the scroll position of viewports when the user hits the back button', asyncSpec(function(next) {

          const longContentHtml = `\
  <div class="viewport" style="width: 100px; height: 100px; overflow-y: scroll">
  <div class="content" style="height: 1000px"></div>
  </div>\
  `;

          const respond = () => this.respondWith(longContentHtml);

          const $viewport = $(longContentHtml).appendTo(document.body);

          up.viewport.config.viewports = ['.viewport'];
          up.history.config.popTargets = ['.viewport'];

          up.replace('.content', '/one');

          next(() => {
            return respond();
          });

          next(() => {
            $viewport.scrollTop(50);
            return up.replace('.content', '/two');
          });

          next(() => {
            return respond();
          });

          next(() => {
            $('.viewport').scrollTop(150);
            return up.replace('.content', '/three');
          });

          next(() => {
            return respond();
          });

          next(() => {
            $('.viewport').scrollTop(250);
            return history.back();
          });

          next.after(100, () => {
            return respond();
          }); // we need to respond since we've never requested /two with the popTarget

          next(() => {
            expect($('.viewport').scrollTop()).toBe(150);
            return history.back();
          });

          next.after(100, () => {
            return respond();
          }); // we need to respond since we've never requested /one with the popTarget

          next(() => {
            expect($('.viewport').scrollTop()).toBe(50);
            return history.forward();
          });

          next.after(100, () => {
            // No need to respond since we requested /two with the popTarget
            // when we went backwards
            expect($('.viewport').scrollTop()).toBe(150);
            return history.forward();
          });

          next.after(100, () => {
            return respond();
          }); // we need to respond since we've never requested /three with the popTarget

          return next(() => {
            return expect($('.viewport').scrollTop()).toBe(250);
          });
        })
        );

        return it('restores the scroll position of two viewports marked with [up-viewport], but not configured in up.viewport.config (bugfix)', asyncSpec(function(next) {
          up.history.config.popTargets = ['.container'];

          const html = `\
  <div class="container">
  <div class="viewport1" up-viewport style="width: 100px; height: 100px; overflow-y: scroll">
    <div class="content1" style="height: 5000px">content1</div>
  </div>
  <div class="viewport2" up-viewport style="width: 100px; height: 100px; overflow-y: scroll">
    <div class="content2" style="height: 5000px">content2</div>
  </div>
  </div>\
  `;

          const respond = () => this.respondWith(html);

          const $screen = $fixture('.screen');
          $screen.html(html);

          up.replace('.content1, .content2', '/one', {reveal: false});

          next(() => {
            return respond();
          });

          next(() => {
            $('.viewport1').scrollTop(3000);
            $('.viewport2').scrollTop(3050);
            expect('.viewport1').toBeScrolledTo(3000);
            expect('.viewport2').toBeScrolledTo(3050);

            return up.replace('.content1, .content2', '/two', {reveal: false});
          });

          next(() => {
            return respond();
          });

          next.after(50, () => {
            expect(location.href).toMatchUrl('/two');
            return history.back();
          });

          next.after(100, () => {
            // we need to respond since we've never requested the original URL with the popTarget
            return respond();
          });

          return next(() => {
            expect('.viewport1').toBeScrolledTo(3000);
            return expect('.viewport2').toBeScrolledTo(3050);
          });
        })
        );
      }));


      return describe('events', () => describeCapability('canPushState', () => it('emits up:history:* events as the user goes forwards and backwards through history', asyncSpec(function(next) {
        up.proxy.config.cacheSize = 0;
        up.history.config.popTargets = ['.viewport'];

        fixture('.viewport .content');
        const respond = () => {
          return this.respondWith(`\
  <div class="viewport">
  <div class="content">content</div>
  </div>\
  `
          );
        };

        const events = [];
        u.each(['up:history:pushed', 'up:history:restored'], eventName => up.on(eventName, event => events.push([eventName, event.url])));

        const normalize = up.history.normalizeUrl;

        up.replace('.content', '/foo');

        next(() => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')]
          ]);

          return up.replace('.content', '/bar');
        });

        next(() => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')]
          ]);

          return up.replace('.content', '/baz');
        });

        next(() => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')],
            ['up:history:pushed', normalize('/baz')]
          ]);

          return history.back();
        });

        next.after(100, () => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')],
            ['up:history:pushed', normalize('/baz')],
            ['up:history:restored', normalize('/bar')]
          ]);

          return history.back();
        });

        next.after(100, () => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')],
            ['up:history:pushed', normalize('/baz')],
            ['up:history:restored', normalize('/bar')],
            ['up:history:restored', normalize('/foo')]
          ]);

          return history.forward();
        });

        next.after(100, () => {
          return respond();
        });

        next(() => {
          expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')],
            ['up:history:pushed', normalize('/baz')],
            ['up:history:restored', normalize('/bar')],
            ['up:history:restored', normalize('/foo')],
            ['up:history:restored', normalize('/bar')]
          ]);

          return history.forward();
        });

        next.after(100, () => {
          return respond();
        }); // we need to respond since we've never requested /baz with the popTarget

        return next(() => {
          return expect(events).toEqual([
            ['up:history:pushed', normalize('/foo')],
            ['up:history:pushed', normalize('/bar')],
            ['up:history:pushed', normalize('/baz')],
            ['up:history:restored', normalize('/bar')],
            ['up:history:restored', normalize('/foo')],
            ['up:history:restored', normalize('/bar')],
            ['up:history:restored', normalize('/baz')]
          ]);
      });}))));
  });
  });
})();