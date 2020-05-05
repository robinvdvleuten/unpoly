/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.fragment', () => describe('JavaScript functions', function() {

    describe('up.fragment.first', function() {

      it('returns the first element with the given selector', function() {
        const match = fixture('.match');
        const noMatch = fixture('.no-match');
        const result = up.fragment.first('.match');
        return expect(result).toBe(match);
      });

      it('returns undefined if there are no matches', function() {
        const result = up.fragment.first('.match');
        return expect(result).toBeUndefined();
      });

      it('does not return an element that is currently destroying', function() {
        const match = fixture('.match.up-destroying');
        const result = up.fragment.first('.match');
        return expect(result).toBeUndefined();
      });

      describe('when given a root element for the search', () => it('only matches descendants of that root', function() {
        const parent1 = fixture('.parent1');
        const parent1Match = e.affix(parent1, '.match');

        const parent2 = fixture('.parent1');
        const parent2Match = e.affix(parent2, '.match');

        expect(up.fragment.first(parent1, '.match')).toBe(parent1Match);
        return expect(up.fragment.first(parent2, '.match')).toBe(parent2Match);
      }));

      describe('with { origin } option', function() {

        it('resolves an & in the selector string with an selector for the origin');

        it('prefers to find an element in the same layer as the origin');

        return it("returns the element in the top-most layer if there are no matches in the origin's layer");
      });

      return describe('with { layer } option', () => it('only matches elements in that layer'));
    });

    describe('up.replace', function() {

      describeCapability('canPushState', function() {

        beforeEach(function() {

          this.$oldBefore = $fixture('.before').text('old-before');
          this.$oldMiddle = $fixture('.middle').text('old-middle');
          this.$oldAfter = $fixture('.after').text('old-after');

          this.responseText =
            `\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `;

          return this.respond = function(options) { if (options == null) { options = {}; } return this.respondWith(this.responseText, options); };
        });

        it('replaces the given selector with the same selector from a freshly fetched page', asyncSpec(function(next) {
          up.replace('.middle', '/path');

          next(() => {
            return this.respond();
          });

          return next.after(10, () => {
            expect($('.before')).toHaveText('old-before');
            expect($('.middle')).toHaveText('new-middle');
            return expect($('.after')).toHaveText('old-after');
          });
        })
        );

        it('returns a promise that will be fulfilled once the server response was received and the fragments were swapped', asyncSpec(function(next) {
          const resolution = jasmine.createSpy();
          const promise = up.replace('.middle', '/path');
          promise.then(resolution);
          expect(resolution).not.toHaveBeenCalled();
          expect($('.middle')).toHaveText('old-middle');

          next(() => {
            return this.respond();
          });

          return next(() => {
            expect(resolution).toHaveBeenCalled();
            return expect($('.middle')).toHaveText('new-middle');
          });
        })
        );

        it('allows to pass an element instead of a selector', asyncSpec(function(next) {
          up.replace(this.$oldMiddle, '/path');

          next(() => {
            return this.respond();
          });

          return next(() => {
            expect($('.before')).toHaveText('old-before');
            expect($('.middle')).toHaveText('new-middle');
            return expect($('.after')).toHaveText('old-after');
          });
        })
        );

        describe('with { transition } option', () => it('returns a promise that will be fulfilled once the server response was received and the swap transition has completed', asyncSpec(function(next) {
          const resolution = jasmine.createSpy();
          const promise = up.replace('.middle', '/path', {transition: 'cross-fade', duration: 200});
          promise.then(resolution);
          expect(resolution).not.toHaveBeenCalled();
          expect($('.middle')).toHaveText('old-middle');

          next(() => {
            this.respond();
            return expect(resolution).not.toHaveBeenCalled();
          });

          next.after(100, () => {
            return expect(resolution).not.toHaveBeenCalled();
          });

          return next.after(200, () => {
            return expect(resolution).toHaveBeenCalled();
          });
        })
        ));

        describe('with { params } option', function() {

          it("uses the given params as a non-GET request's payload", asyncSpec(function(next) {
            const givenParams = { 'foo-key': 'foo-value', 'bar-key': 'bar-value' };
            up.replace('.middle', '/path', {method: 'put', params: givenParams});

            return next(() => {
              expect(this.lastRequest().data()['foo-key']).toEqual(['foo-value']);
              return expect(this.lastRequest().data()['bar-key']).toEqual(['bar-value']);
            });
          })
          );

          return it("encodes the given params into the URL of a GET request", asyncSpec(function(next) {
            const givenParams = { 'foo-key': 'foo-value', 'bar-key': 'bar-value' };
            up.replace('.middle', '/path', {method: 'get', params: givenParams});
            return next(() => expect(this.lastRequest().url).toMatchUrl('/path?foo-key=foo-value&bar-key=bar-value'));
          })
          );
        });

        it('uses a HTTP method given as { method } option', asyncSpec(function(next) {
          up.replace('.middle', '/path', {method: 'put'});
          return next(() => expect(this.lastRequest()).toHaveRequestMethod('PUT'));
        })
        );

        describe('when the server responds with an error', function() {

          it('replaces the first fallback instead of the given selector', asyncSpec(function(next) {
            up.fragment.config.fallbacks = ['.fallback'];
            $fixture('.fallback');

            // can't have the example replace the Jasmine test runner UI
            const extractSpy = up.fragment.knife.mock('extract').and.returnValue(Promise.resolve());

            next(() => up.replace('.middle', '/path'));
            next(() => this.respond({status: 500}));
            return next(() => expect(extractSpy).toHaveBeenCalledWith('.fallback', jasmine.any(String), jasmine.any(Object)));
          })
          );

          it('uses a target selector given as { failTarget } option', asyncSpec(function(next) {
            next(() => {
              return up.replace('.middle', '/path', {failTarget: '.after'});
            });

            next(() => {
              return this.respond({status: 500});
            });

            return next(() => {
              expect($('.middle')).toHaveText('old-middle');
              return expect($('.after')).toHaveText('new-after');
            });
          })
          );

          return it('rejects the returned promise', function(done) {
            $fixture('.after');
            const promise = up.replace('.middle', '/path', {failTarget: '.after'});

            return u.task(() => {
              return promiseState(promise).then(result => {
                expect(result.state).toEqual('pending');

                this.respond({status: 500});

                return u.task(() => {
                  return promiseState(promise).then(result => {
                    expect(result.state).toEqual('rejected');
                    return done();
                  });
                });
              });
            });
          });
        });

        describe('when the request times out', () => it("doesn't crash and rejects the returned promise", asyncSpec(function(next) {
          jasmine.clock().install(); // required by responseTimeout()
          $fixture('.target');
          const promise = up.replace('.middle', '/path', {timeout: 50});

          next(() => {
            // See that the correct timeout value has been set on the XHR instance
            return expect(this.lastRequest().timeout).toEqual(50);
          });

          next.await(() => {
            // See that the promise is still pending before the timeout
            return promiseState(promise).then(result => expect(result.state).toEqual('pending'));
          });

          next(() => {
            return this.lastRequest().responseTimeout();
          });

          return next.await(() => {
            return promiseState(promise).then(result => expect(result.state).toEqual('rejected'));
          });
        })
        ));

        describe('when there is a network issue', () => it("doesn't crash and rejects the returned promise", function(done) {
          $fixture('.target');
          const promise = up.replace('.middle', '/path');

          return u.task(() => {
            return promiseState(promise).then(result => {
              expect(result.state).toEqual('pending');
              this.lastRequest().responseError();
              return u.task(() => {
                return promiseState(promise).then(result => {
                  expect(result.state).toEqual('rejected');
                  return done();
                });
              });
            });
          });
        }));

        describe('history', function() {

          beforeEach(() => up.history.config.enabled = true);

          it('should set the browser location to the given URL', function(done) {
            const promise = up.replace('.middle', '/path');
            this.respond();
            return promise.then(function() {
              expect(location.href).toMatchUrl('/path');
              return done();
            });
          });

          it('does not add a history entry after non-GET requests', asyncSpec(function(next) {
            up.replace('.middle', '/path', {method: 'post'});
            next(() => this.respond());
            return next(() => expect(location.href).toMatchUrl(this.hrefBeforeExample));
          })
          );

          it('adds a history entry after non-GET requests if the response includes a { X-Up-Method: "get" } header (will happen after a redirect)', asyncSpec(function(next) {
            up.replace('.middle', '/requested-path', {method: 'post'});
            next(() => this.respond({responseHeaders: {
              'X-Up-Method': 'GET',
              'X-Up-Location': '/signaled-path'
            }
            })
            );
            return next(() => expect(location.href).toMatchUrl('/signaled-path'));
          })
          );

          it('does not a history entry after a failed GET-request', asyncSpec(function(next) {
            up.replace('.middle', '/path', {method: 'post', failTarget: '.middle'});
            next(() => this.respond({status: 500}));
            return next(() => expect(location.href).toMatchUrl(this.hrefBeforeExample));
          })
          );

          it('does not add a history entry with { history: false } option', asyncSpec(function(next) {
            up.replace('.middle', '/path', {history: false});
            next(() => this.respond());
            return next(() => expect(location.href).toMatchUrl(this.hrefBeforeExample));
          })
          );

          it("detects a redirect's new URL when the server sets an X-Up-Location header", asyncSpec(function(next) {
            up.replace('.middle', '/path');
            next(() => this.respond({responseHeaders: { 'X-Up-Location': '/other-path' }}));
            return next(() => expect(location.href).toMatchUrl('/other-path'));
          })
          );

          it('adds params from a { params } option to the URL of a GET request', asyncSpec(function(next) {
            up.replace('.middle', '/path', {params: { 'foo-key': 'foo value', 'bar-key': 'bar value' }});
            next(() => this.respond());
            return next(() => expect(location.href).toMatchUrl('/path?foo-key=foo%20value&bar-key=bar%20value'));
          })
          );

          return describe('if a URL is given as { history } option', function() {

            it('uses that URL as the new location after a GET request', asyncSpec(function(next) {
              up.replace('.middle', '/path', {history: '/given-path'});
              next(() => this.respond({failTarget: '.middle'}));
              return next(() => expect(location.href).toMatchUrl('/given-path'));
            })
            );

            it('adds a history entry after a non-GET request', asyncSpec(function(next) {
              up.replace('.middle', '/path', {method: 'post', history: '/given-path'});
              next(() => this.respond({failTarget: '.middle'}));
              return next(() => expect(location.href).toMatchUrl('/given-path'));
            })
            );

            return it('does not add a history entry after a failed non-GET request', asyncSpec(function(next) {
              up.replace('.middle', '/path', {method: 'post', history: '/given-path', failTarget: '.middle'});
              next(() => this.respond({failTarget: '.middle', status: 500}));
              return next(() => expect(location.href).toMatchUrl(this.hrefBeforeExample));
            })
            );
          });
        });

        describe('source', function() {

          it('remembers the source the fragment was retrieved from', function(done) {
            const promise = up.replace('.middle', '/path');
            this.respond();
            return promise.then(function() {
              expect($('.middle').attr('up-source')).toMatch(/\/path$/);
              return done();
            });
          });

          it('reuses the previous source for a non-GET request (since that is reloadable)', asyncSpec(function(next) {
            this.$oldMiddle.attr('up-source', '/previous-source');
            up.replace('.middle', '/path', {method: 'post'});
            next(() => {
              return this.respond();
            });
            return next(() => {
              expect($('.middle')).toHaveText('new-middle');
              return expect(up.fragment.source('.middle')).toMatchUrl('/previous-source');
            });
          })
          );

          return describe('if a URL is given as { source } option', function() {

            it('uses that URL as the source for a GET request', asyncSpec(function(next) {
              up.replace('.middle', '/path', {source: '/given-path'});
              next(() => this.respond());
              return next(() => expect(up.fragment.source('.middle')).toMatchUrl('/given-path'));
            })
            );

            it('uses that URL as the source after a non-GET request', asyncSpec(function(next) {
              up.replace('.middle', '/path', {method: 'post', source: '/given-path'});
              next(() => this.respond());
              return next(() => expect(up.fragment.source('.middle')).toMatchUrl('/given-path'));
            })
            );

            return it('ignores the option and reuses the previous source after a failed non-GET request', asyncSpec(function(next) {
              this.$oldMiddle.attr('up-source', '/previous-source');
              up.replace('.middle', '/path', {method: 'post', source: '/given-path', failTarget: '.middle'});
              next(() => this.respond({status: 500}));
              return next(() => expect(up.fragment.source('.middle')).toMatchUrl('/previous-source'));
            })
            );
          });
        });

        describe('document title', function() {

          beforeEach(() => up.history.config.enabled = true);

          it("sets the document title to the response <title>", asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            up.replace('.container', '/path');

            next(() => {
              return this.respondWith(`\
  <html>
  <head>
    <title>Title from HTML</title>
  </head>
  <body>
    <div class='container'>
      new container text
    </div>
  </body>
  </html>\
  `
              );
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('Title from HTML');
            });
          })
          );

          it("sets the document title to an 'X-Up-Title' header in the response", asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            up.replace('.container', '/path');

            next(() => {
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Title': 'Title from header'
                },
                responseText: `\
  <div class='container'>
  new container text
  </div>\
  `
              });
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('Title from header');
            });
          })
          );

          it("prefers the X-Up-Title header to the response <title>", asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            up.replace('.container', '/path');

            next(() => {
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Title': 'Title from header'
                },
                responseText: `\
  <html>
  <head>
    <title>Title from HTML</title>
  </head>
  <body>
    <div class='container'>
      new container text
    </div>
  </body>
  </html>\
  `
              });
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('Title from header');
            });
          })
          );

          it("sets the document title to the response <title> with { history: false, title: true } options (bugfix)", asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            up.replace('.container', '/path', {history: false, title: true});

            next(() => {
              return this.respondWith(`\
  <html>
  <head>
    <title>Title from HTML</title>
  </head>
  <body>
    <div class='container'>
      new container text
    </div>
  </body>
  </html>\
  `
              );
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('Title from HTML');
            });
          })
          );

          it('does not update the document title if the response has a <title> tag inside an inline SVG image (bugfix)', asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            document.title = 'old document title';
            up.replace('.container', '/path', {history: false, title: true});

            next(() => {
              return this.respondWith(`\
  <svg width="500" height="300" xmlns="http://www.w3.org/2000/svg">
  <g>
    <title>SVG Title Demo example</title>
    <rect x="10" y="10" width="200" height="50" style="fill:none; stroke:blue; stroke-width:1px"/>
  </g>
  </svg>

  <div class='container'>
  new container text
  </div>\
  `
              );
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('old document title');
            });
          })
          );

          it("does not extract the title from the response or HTTP header if history isn't updated", asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            document.title = 'old document title';
            up.replace('.container', '/path', {history: false});

            next(() => {
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Title': 'Title from header'
                },
                responseText: `\
  <html>
  <head>
    <title>Title from HTML</title>
  </head>
  <body>
    <div class='container'>
      new container text
    </div>
  </body>
  </html>\
  `
              });
            });

            return next(() => {
              return expect(document.title).toBe('old document title');
            });
          })
          );

          return it('allows to pass an explicit title as { title } option', asyncSpec(function(next) {
            $fixture('.container').text('old container text');
            up.replace('.container', '/path', {title: 'Title from options'});

            next(() => {
              return this.respondWith(`\
  <html>
  <head>
    <title>Title from HTML</title>
  </head>
  <body>
    <div class='container'>
      new container text
    </div>
  </body>
  </html>\
  `
              );
            });

            return next(() => {
              expect($('.container')).toHaveText('new container text');
              return expect(document.title).toBe('Title from options');
            });
          })
          );
        });

        describe('selector processing', function() {

          it('replaces multiple selectors separated with a comma', function(done) {
            const promise = up.replace('.middle, .after', '/path');
            this.respond();
            return promise.then(function() {
              expect($('.before')).toHaveText('old-before');
              expect($('.middle')).toHaveText('new-middle');
              expect($('.after')).toHaveText('new-after');
              return done();
            });
          });

          describe('nested selector merging', function() {

            it('replaces a single fragment if a selector contains a subsequent selector in the current page', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer, .inner', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                expect($('.inner')).toBeAttached();
                return expect($('.inner').text()).toContain('new inner text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not merge selectors if a selector contains a subsequent selector, but prepends instead of replacing', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer:before, .inner', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer:before, .inner');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                expect($('.outer').text()).toContain('old outer text');
                expect($('.inner')).toBeAttached();
                return expect($('.inner').text()).toContain('new inner text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not merge selectors if a selector contains a subsequent selector, but appends instead of replacing', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer:after, .inner', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer:after, .inner');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('old outer text');
                expect($('.outer').text()).toContain('new outer text');
                expect($('.inner')).toBeAttached();
                return expect($('.inner').text()).toContain('new inner text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not lose selector pseudo-classes when merging selectors (bugfix)', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer:after, .inner', '/path');

              return next(() => {
                return expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer:after, .inner');
              });
            })
            );

            it('replaces a single fragment if a selector contains a previous selector in the current page', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer, .inner', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                expect($('.inner')).toBeAttached();
                return expect($('.inner').text()).toContain('new inner text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not lose a { reveal: true } option if the first selector was merged into a subsequent selector', asyncSpec(function(next) {
              const revealStub = up.viewport.knife.mock('reveal');

              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              up.replace('.inner, .outer', '/path', {reveal: true});

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
  </div>
  </div>\
  `
                );
              });

              return next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                expect($('.inner')).toBeAttached();
                expect($('.inner').text()).toContain('new inner text');

                return expect(revealStub).toHaveBeenCalled();
              });
            })
            );


            it('does not lose a { reveal: string } option if the first selector was merged into a subsequent selector', asyncSpec(function(next) {
              const revealStub = up.viewport.knife.mock('reveal');

              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              up.replace('.inner, .outer', '/path', {reveal: '.revealee'});

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.outer');

                return this.respondWith(`\
  <div class="outer">
  new outer text
  <div class="inner">
    new inner text
    <div class="revealee">
      revealee text
    </div>
  </div>
  </div>\
  `
                );
              });

              return next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                expect($('.inner')).toBeAttached();
                expect($('.inner').text()).toContain('new inner text');

                expect(revealStub).toHaveBeenCalled();
                const revealArg = revealStub.calls.mostRecent().args[0];
                return expect(revealArg).toMatchSelector('.revealee');
              });
            })
            );


            it('replaces a single fragment if the nesting differs in current page and response', asyncSpec(function(next) {
              const $outer = $fixture('.outer').text('old outer text');
              const $inner = $outer.affix('.inner').text('old inner text');

              const replacePromise = up.replace('.outer, .inner', '/path');

              next(() => {
                return this.respondWith(`\
  <div class="inner">
  new inner text
  <div class="outer">
    new outer text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.outer')).toBeAttached();
                expect($('.outer').text()).toContain('new outer text');
                return expect($('.inner')).not.toBeAttached();
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not crash if two selectors that are siblings in the current page are nested in the response', asyncSpec(function(next) {
              const $outer = $fixture('.one').text('old one text');
              const $inner = $fixture('.two').text('old two text');

              const replacePromise = up.replace('.one, .two', '/path');

              next(() => {
                return this.respondWith(`\
  <div class="one">
  new one text
  <div class="two">
    new two text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.one')).toBeAttached();
                expect($('.one').text()).toContain('new one text');
                expect($('.two')).toBeAttached();
                return expect($('.two').text()).toContain('new two text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('does not crash if selectors that siblings in the current page are inversely nested in the response', asyncSpec(function(next) {
              const $outer = $fixture('.one').text('old one text');
              const $inner = $fixture('.two').text('old two text');

              const replacePromise = up.replace('.one, .two', '/path');

              next(() => {
                return this.respondWith(`\
  <div class="two">
  new two text
  <div class="one">
    new one text
  </div>
  </div>\
  `
                );
              });

              next(() => {
                expect($('.one')).toBeAttached();
                expect($('.one').text()).toContain('new one text');
                expect($('.two')).toBeAttached();
                return expect($('.two').text()).toContain('new two text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('updates the first selector if the same element is targeted twice in a single replacement', asyncSpec(function(next) {
              const $one = $fixture('.one.alias').text('old one text');

              const replacePromise = up.replace('.one, .alias', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.one');

                return this.respondWith(`\
  <div class="one">
  new one text
  </div>\
  `
                );
              });

              next(() => {
                expect($('.one')).toBeAttached();
                return expect($('.one').text()).toContain('new one text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            it('updates the first selector if the same element is prepended or appended twice in a single replacement', asyncSpec(function(next) {
              const $one = $fixture('.one').text('old one text');

              const replacePromise = up.replace('.one:before, .one:after', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.one:before');

                return this.respondWith(`\
  <div class="one">
  new one text
  </div>\
  `
                );
              });

              next(() => {
                expect($('.one')).toBeAttached();
                return expect($('.one').text()).toMatchText('new one text old one text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );

            return it("updates the first selector if the same element is prepended, replaced and appended in a single replacement", asyncSpec(function(next) {
              const $elem = $fixture('.elem.alias1.alias2').text("old text");

              const replacePromise = up.replace('.elem:before, .alias1, .alias2:after', '/path');

              next(() => {
                expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.elem:before');

                return this.respondWith(`\
  <div class="elem alias1 alias2">
  new text
  </div>\
  `
                );
              });

              next(() => {
                expect('.elem').toBeAttached();
                return expect($('.elem').text()).toMatchText('new text old text');
              });

              return next.await(() => {
                const promise = promiseState(replacePromise);
                return promise.then(result => expect(result.state).toEqual('fulfilled'));
              });
            })
            );
          });

          it('replaces the body if asked to replace the "html" selector');

          it('prepends instead of replacing when the target has a :before pseudo-selector', function(done) {
            const promise = up.replace('.middle:before', '/path');
            this.respond();
            return promise.then(function() {
              expect($('.before')).toHaveText('old-before');
              expect($('.middle')).toHaveText('new-middleold-middle');
              expect($('.after')).toHaveText('old-after');
              return done();
            });
          });

          it('appends instead of replacing when the target has a :after pseudo-selector', function(done) {
            const promise = up.replace('.middle:after', '/path');
            this.respond();
            return promise.then(function() {
              expect($('.before')).toHaveText('old-before');
              expect($('.middle')).toHaveText('old-middlenew-middle');
              expect($('.after')).toHaveText('old-after');
              return done();
            });
          });

          it("lets the developer choose between replacing/prepending/appending for each selector", function(done) {
            const promise = up.replace('.before:before, .middle, .after:after', '/path');
            this.respond();
            return promise.then(function() {
              expect($('.before')).toHaveText('new-beforeold-before');
              expect($('.middle')).toHaveText('new-middle');
              expect($('.after')).toHaveText('old-afternew-after');
              return done();
            });
          });

          it('understands non-standard CSS selector extensions such as :has(...)', function(done) {
            const $first = $fixture('.boxx#first');
            const $firstChild = $('<span class="first-child">old first</span>').appendTo($first);
            const $second = $fixture('.boxx#second');
            const $secondChild = $('<span class="second-child">old second</span>').appendTo($second);

            const promise = up.replace('.boxx:has(.first-child)', '/path');
            this.respondWith(`\
  <div class="boxx" id="first">
  <span class="first-child">new first</span>
  </div>\
  `
            );

            return promise.then(function() {
              expect($('#first span')).toHaveText('new first');
              expect($('#second span')).toHaveText('old second');
              return done();
            });
          });

          describe('when selectors are missing on the page before the request was made', function() {

            beforeEach(() => up.fragment.config.fallbacks = []);

            it('tries selectors from options.fallback before making a request', asyncSpec(function(next) {
              $fixture('.box').text('old box');
              up.replace('.unknown', '/path', {fallback: '.box'});

              next(() => this.respondWith('<div class="box">new box</div>'));
              return next(() => expect('.box').toHaveText('new box'));
            })
            );

            it('rejects the promise if all alternatives are exhausted', function(done) {
              const promise = up.replace('.unknown', '/path', {fallback: '.more-unknown'});
              return promise.catch(function(e) {
                expect(e).toBeError(/Could not find target in current page/i);
                return done();
              });
            });

            it('considers a union selector to be missing if one of its selector-atoms are missing', asyncSpec(function(next) {
              $fixture('.target').text('old target');
              $fixture('.fallback').text('old fallback');
              up.replace('.target, .unknown', '/path', {fallback: '.fallback'});

              next(() => {
                return this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );
              });

              return next(() => {
                expect('.target').toHaveText('old target');
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            it('tries a selector from up.fragment.config.fallbacks if options.fallback is missing', asyncSpec(function(next) {
              up.fragment.config.fallbacks = ['.existing'];
              $fixture('.existing').text('old existing');
              up.replace('.unknown', '/path');
              next(() => this.respondWith('<div class="existing">new existing</div>'));
              return next(() => expect('.existing').toHaveText('new existing'));
            })
            );

            return it('does not try a selector from up.fragment.config.fallbacks and rejects the promise if options.fallback is false', function(done) {
              up.fragment.config.fallbacks = ['.existing'];
              $fixture('.existing').text('old existing');
              return up.replace('.unknown', '/path', {fallback: false}).catch(function(e) {
                expect(e).toBeError(/Could not find target in current page/i);
                return done();
              });
            });
          });

          describe('when selectors are missing on the page after the request was made', function() {

            beforeEach(() => up.fragment.config.fallbacks = []);

            it('tries selectors from options.fallback before swapping elements', asyncSpec(function(next) {
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target', '/path', {fallback: '.fallback'});
              $target.remove();

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

            it('rejects the promise if all alternatives are exhausted', function(done) {
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              const promise = up.replace('.target', '/path', {fallback: '.fallback'});
              $target.remove();
              $fallback.remove();

              return u.task(() => {
                this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );

                return u.task(() => {
                  return promiseState(promise).then(function(result) {
                    expect(result.state).toEqual('rejected');
                    expect(result.value).toBeError(/Could not find target in current page/i);
                    return done();
                  });
                });
              });
            });

            it('considers a union selector to be missing if one of its selector-atoms are missing', asyncSpec(function(next) {
              const $target = $fixture('.target').text('old target');
              const $target2 = $fixture('.target2').text('old target2');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target, .target2', '/path', {fallback: '.fallback'});
              $target2.remove();

              next(() => {
                return this.respondWith(`\
  <div class="target">new target</div>
  <div class="target2">new target2</div>
  <div class="fallback">new fallback</div>\
  `
                );
              });
              return next(() => {
                expect('.target').toHaveText('old target');
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            it('tries a selector from up.fragment.config.fallbacks if options.fallback is missing', asyncSpec(function(next) {
              up.fragment.config.fallbacks = ['.fallback'];
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target', '/path');
              $target.remove();

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

            return it('does not try a selector from up.fragment.config.fallbacks and rejects the promise if options.fallback is false', function(done) {
              up.fragment.config.fallbacks = ['.fallback'];
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              const promise = up.replace('.target', '/path', {fallback: false});
              $target.remove();

              return u.task(() => {
                this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );

                return promise.catch(function(e) {
                  expect(e).toBeError(/Could not find target in current page/i);
                  return done();
                });
              });
            });
          });

          return describe('when selectors are missing in the response', function() {

            beforeEach(() => up.fragment.config.fallbacks = []);

            it('tries selectors from options.fallback before swapping elements', asyncSpec(function(next) {
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target', '/path', {fallback: '.fallback'});

              next(() => {
                return this.respondWith(`\
  <div class="fallback">new fallback</div>\
  `
                );
              });

              return next(() => {
                expect('.target').toHaveText('old target');
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            describe('if all alternatives are exhausted', function() {

              it('rejects the promise', function(done) {
                const $target = $fixture('.target').text('old target');
                const $fallback = $fixture('.fallback').text('old fallback');
                const promise = up.replace('.target', '/path', {fallback: '.fallback'});

                u.task(() => {
                  return this.respondWith('<div class="unexpected">new unexpected</div>');
                });

                return promise.catch(function(e) {
                  expect(e).toBeError(/Could not find target in response/i);
                  return done();
                });
              });

              return it('shows a link to open the unexpected response', function(done) {
                const $target = $fixture('.target').text('old target');
                const $fallback = $fixture('.fallback').text('old fallback');
                const promise = up.replace('.target', '/path', {fallback: '.fallback'});
                const navigate = spyOn(up.browser, 'navigate');

                u.task(() => {
                  return this.respondWith('<div class="unexpected">new unexpected</div>');
                });

                return promise.catch(function(e) {
                  const $toast = $('.up-toast');
                  expect($toast).toBeAttached();
                  const $inspectLink = $toast.find(".up-toast-action:contains('Open response')");
                  expect($inspectLink).toBeAttached();
                  expect(navigate).not.toHaveBeenCalled();

                  Trigger.clickSequence($inspectLink);

                  return u.task(() => {
                    expect(navigate).toHaveBeenCalledWith('/path', {});
                    return done();
                  });
                });
              });
            });

            it('considers a union selector to be missing if one of its selector-atoms are missing', asyncSpec(function(next) {
              const $target = $fixture('.target').text('old target');
              const $target2 = $fixture('.target2').text('old target2');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target, .target2', '/path', {fallback: '.fallback'});

              next(() => {
                return this.respondWith(`\
  <div class="target">new target</div>
  <div class="fallback">new fallback</div>\
  `
                );
              });

              return next(() => {
                expect('.target').toHaveText('old target');
                expect('.target2').toHaveText('old target2');
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            it('tries a selector from up.fragment.config.fallbacks if options.fallback is missing', asyncSpec(function(next) {
              up.fragment.config.fallbacks = ['.fallback'];
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              up.replace('.target', '/path');

              next(() => {
                return this.respondWith('<div class="fallback">new fallback</div>');
              });

              return next(() => {
                expect('.target').toHaveText('old target');
                return expect('.fallback').toHaveText('new fallback');
              });
            })
            );

            return it('does not try a selector from up.fragment.config.fallbacks and rejects the promise if options.fallback is false', function(done) {
              up.fragment.config.fallbacks = ['.fallback'];
              const $target = $fixture('.target').text('old target');
              const $fallback = $fixture('.fallback').text('old fallback');
              const promise = up.replace('.target', '/path', {fallback: false});

              u.task(() => {
                return this.respondWith('<div class="fallback">new fallback</div>');
              });

              return promise.catch(function(e) {
                expect(e).toBeError(/Could not find target in response/i);
                return done();
              });
            });
          });
        });

        describe('execution of scripts', function() {

          beforeEach(() => window.scriptTagExecuted = jasmine.createSpy('scriptTagExecuted'));

          describe('inline scripts', function() {

            it('does not execute inline script tags', function(done) {
              this.responseText = `\
  <div class="middle">
  new-middle
  <script type="text/javascript">
    window.scriptTagExecuted()
  </script>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return promise.then(function() {
                expect(window.scriptTagExecuted).not.toHaveBeenCalled();
                return done();
              });
            });

            return it('does not crash when the new fragment contains inline script tag that is followed by another sibling (bugfix)', function(done) {
              this.responseText = `\
  <div class="middle">
  <div>new-middle-before</div>
  <script type="text/javascript">
    window.scriptTagExecuted()
  </script>
  <div>new-middle-after</div>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return u.task(() => promiseState(promise).then(function(result) {
                expect(result.state).toEqual('fulfilled');
                expect(window.scriptTagExecuted).not.toHaveBeenCalled();
                return done();
              }));
            });
          });

          describe('linked scripts', function() {

            beforeEach(function() {
              // Add a cache-buster to each path so the browser cache is guaranteed to be irrelevant
              return this.linkedScriptPath = `/assets/fixtures/linked_script.js?cache-buster=${Math.random().toString()}`;
            });

            return it('does not execute linked scripts to prevent re-inclusion of javascript inserted before the closing body tag', function(done) {
              this.responseText = `\
  <div class="middle">
  new-middle
  <script type="text/javascript" src="${this.linkedScriptPath}">
    alert("inside")
  </script>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return promise.then(() => {

                // Must respond to this request, since jQuery makes them async: false
                if (u.contains(this.lastRequest().url, 'linked_script')) {
                  this.respondWith('window.scriptTagExecuted()');
                }

                // Now wait for jQuery to parse out <script> tags and fetch the linked scripts.
                // This actually happens with jasmine_ajax's fake XHR object.
                return u.task(() => {
                  expect(jasmine.Ajax.requests.count()).toEqual(1);
                  expect(this.lastRequest().url).not.toContain('linked_script');
                  expect(window.scriptTagExecuted).not.toHaveBeenCalled();
                  return done();
                });
              });
            });
          });

          describe('<noscript> tags', function() {

            it('parses <noscript> contents as text, not DOM nodes (since it will be placed in a scripting-capable browser)', function(done) {
              this.responseText = `\
  <div class="middle">
  <noscript>
    <img src="foo.png">
  </noscript>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return promise.then(function() {
                const $noscript = $('.middle noscript');
                const text = $noscript.text().trim();
                expect(text).toEqual('<img src="foo.png">');
                return done();
              });
            });

            it('parses <noscript> contents with multiple lines as text, not DOM nodes', function(done) {
              this.responseText = `\
  <div class="middle">
  <noscript>
    <img src="foo.png">
    <img src="bar.png">
  </noscript>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return promise.then(function() {
                const $noscript = $('.middle noscript');
                const text = $noscript.text().trim();
                expect(text).toMatch(/<img src="foo\.png">\s+<img src="bar\.png">/);
                return done();
              });
            });

            return it('parses multiple <noscript> tags in the same fragment as text, not DOM nodes', function(done) {
              this.responseText = `\
  <div class="middle">
  <noscript>
    <img src="foo.png">
  </noscript>
  <noscript>
    <img src="bar.png">
  </noscript>
  </div>\
  `;

              const promise = up.replace('.middle', '/path');
              this.respond();

              return promise.then(function() {
                const $noscripts = $('.middle noscript');
                expect($noscripts.length).toBe(2);
                const text0 = $noscripts[0].textContent.trim();
                const text1 = $noscripts[1].textContent.trim();
                expect(text0).toEqual('<img src="foo.png">');
                expect(text1).toEqual('<img src="bar.png">');
                return done();
              });
            });
          });

          if (up.browser.canCustomElements()) {

            return describe('custom elements', function() {

              beforeAll(function() {
                var TestComponent = function() {
                  const instance = Reflect.construct(HTMLElement, [], TestComponent);
                  instance.innerHTML = 'text from component';
                  up.emit('test-component:new');
                  return instance;
                };
                Object.setPrototypeOf(TestComponent.prototype, HTMLElement.prototype);
                Object.setPrototypeOf(TestComponent, HTMLElement);

                return window.customElements.define('test-component-activation', TestComponent);
              });

              it('activates custom elements in inserted fragments', function(done) {
                this.responseText = `\
  <div class="middle">
  <test-component-activation></test-component-activation>
  </div>\
  `;

                const promise = up.replace('.middle', '/path');
                this.respond();

                return promise.then(function() {
                  expect('.middle test-component-activation').toHaveText('text from component');
                  return done();
                });
              });

              return it('does not activate custom elements outside of inserted fragments', function(done) {
                const constructorSpy = jasmine.createSpy('constructor called');
                up.on('test-component:new', constructorSpy);

                this.responseText = `\
  <div class="before">
  <test-component-activation></test-component-activation>
  </div>
  <div class="middle">
  <test-component-activation></test-component-activation>
  </div>
  <div class="after">
  <test-component-activation></test-component-activation>
  </div>\
  `;

                const promise = up.replace('.middle', '/path');
                this.respond();

                return promise.then(() => {
                  expect(constructorSpy.calls.count()).toBe(1);
                  return done();
                });
              });
            });
          }
        });


        describe('with { restoreScroll: true } option', function() {

          beforeEach(() => up.history.config.enabled = true);

          return it('restores the scroll positions of all viewports around the target', asyncSpec(function(next) {

            const $viewport = $fixture('div[up-viewport] .element').css({
              'height': '100px',
              'width': '100px',
              'overflow-y': 'scroll'
            });

            const respond = () => {
              return this.lastRequest().respondWith({
                status: 200,
                contentType: 'text/html',
                responseText: '<div class="element" style="height: 300px"></div>'
              });
            };

            up.replace('.element', '/foo');

            next(() => respond());
            next(() => $viewport.scrollTop(65));
            next(() => up.replace('.element', '/bar'));
            next(() => respond());
            next(() => $viewport.scrollTop(0));
            next.await(() => up.replace('.element', '/foo', {restoreScroll: true}));
            // No need to respond because /foo has been cached before
            return next(() => expect($viewport.scrollTop()).toEqual(65));
          })
          );
        });

        describe('with { reveal } option', function() {

          beforeEach(function() {
            up.history.config.enabled = true;

            this.revealedHTML = [];
            this.revealedText = [];
            this.revealOptions = {};

            return this.revealMock = up.viewport.knife.mock('reveal').and.callFake((element, options) => {
              this.revealedHTML.push(element.outerHTML);
              this.revealedText.push(element.textContent.trim());
              this.revealOptions = options;
              return Promise.resolve();
            });
          });

          it('reveals a new element before it is being replaced', asyncSpec(function(next) {
            up.replace('.middle', '/path', {reveal: true});

            next(() => {
              return this.respond();
            });

            return next(() => {
              expect(this.revealMock).not.toHaveBeenCalledWith(this.$oldMiddle[0]);
              return expect(this.revealedText).toEqual(['new-middle']);
          });}));

          it('allows to pass another selector to reveal', asyncSpec(function(next){
            const $other = $fixture('.other').text('other text');

            up.replace('.middle', '/path', {reveal: '.other'});

            next(() => {
              return this.respond();
            });

            return next(() => {
              return expect(this.revealedText).toEqual(['other text']);
          });}));

          it('allows to refer to the replacement { origin } as "&" in the { reveal } selector', asyncSpec(function(next) {
            const $origin = $fixture('.origin').text('origin text');

            up.replace('.middle', '/path', {reveal: '&', origin: '.origin'});

            next(() => {
              return this.respond();
            });

            return next(() => {
              return expect(this.revealedText).toEqual(['origin text']);
          });}));

          describe('when the server responds with an error code', function() {

            it('ignores the { reveal } option', asyncSpec(function(next) {
              const $failTarget = $fixture('.fail-target');
              up.replace('.middle', '/path', {failTarget: '.fail-target', reveal: true});

              next(() => {
                return this.respond({status: 500});
              });

              return next(() => {
                return expect(this.revealMock).not.toHaveBeenCalled();
              });
            })
            );

            it('accepts a { failReveal } option for error responses', asyncSpec(function(next) {
              const $failTarget = $fixture('.fail-target').text('old fail target text');
              up.replace('.middle', '/path', {failTarget: '.fail-target', reveal: false, failReveal: true});

              next(() => {});
              this.respondWith({
                status: 500,
                responseText: `\
  <div class="fail-target">
  new fail target text
  </div>\
  `
              });

              return next(() => {
                return expect(this.revealedText).toEqual(['new fail target text']);
            });}));

            return it('allows to refer to the replacement { origin } as "&" in the { failTarget } selector', asyncSpec(function(next) {
              const $origin = $fixture('.origin').text('origin text');
              const $failTarget = $fixture('.fail-target').text('old fail target text');
              up.replace('.middle', '/path', {failTarget: '.fail-target', reveal: false, failReveal: '&', origin: $origin});

              next(() => {
                return this.respondWith({
                  status: 500,
                  responseText: `\
  <div class="fail-target">
  new fail target text
  </div>\
  `
                });
              });

              return next(() => {
                return expect(this.revealedText).toEqual(['origin text']);
            });}));
        });

          describe('when more than one fragment is replaced', () => it('only reveals the first fragment', asyncSpec(function(next) {
            up.replace('.middle, .after', '/path', {reveal: true});

            next(() => {
              return this.respond();
            });

            return next(() => {
              expect(this.revealMock).not.toHaveBeenCalledWith(this.$oldMiddle[0]);
              return expect(this.revealedText).toEqual(['new-middle']);
          });})));

          describe('when there is an anchor #hash in the URL', function() {

            it('scrolls to the top of an element with the ID of that #hash', asyncSpec(function(next) {
              up.replace('.middle', '/path#hash', {reveal: true});
              this.responseText =
                `\
  <div class="middle">
  <div id="hash"></div>
  </div>\
  `;

              next(() => {
                return this.respond();
              });

              return next(() => {
                expect(this.revealedHTML).toEqual(['<div id="hash"></div>']);
                return expect(this.revealOptions).toEqual(jasmine.objectContaining({top: true}));
              });
            })
            );

            it("scrolls to the top of an <a> element with the name of that hash", asyncSpec(function(next) {
              up.replace('.middle', '/path#three', {reveal: true});
              this.responseText =
                `\
  <div class="middle">
  <a name="three"></a>
  </div>\
  `;

              next(() => {
                return this.respond();
              });

              return next(() => {
                expect(this.revealedHTML).toEqual(['<a name="three"></a>']);
                return expect(this.revealOptions).toEqual(jasmine.objectContaining({top: true}));
              });
            })
            );

            it("scrolls to a hash that includes a dot character ('.') (bugfix)", asyncSpec(function(next) {
              up.replace('.middle', '/path#foo.bar', {reveal: true});
              this.responseText =
                `\
  <div class="middle">
  <a name="foo.bar"></a>
  </div>\
  `;

              next(() => {
                return this.respond();
              });

              return next(() => {
                expect(this.revealedHTML).toEqual(['<a name="foo.bar"></a>']);
                return expect(this.revealOptions).toEqual(jasmine.objectContaining({top: true}));
              });
            })
            );

            it('does not scroll if { reveal: false } is also set', asyncSpec(function(next) {
              up.replace('.middle', '/path#hash', {reveal: false});
              this.responseText =
                `\
  <div class="middle">
  <div id="hash"></div>
  </div>\
  `;

              next(() => {
                return this.respond();
              });

              return next(() => {
                return expect(this.revealMock).not.toHaveBeenCalled();
              });
            })
            );

            it('reveals multiple consecutive #hash targets with the same URL (bugfix)', asyncSpec(function(next) {
              up.replace('.middle', '/path#two', {reveal: true});
              this.responseText =
                `\
  <div class="middle">
  <div id="one">one</div>
  <div id="two">two</div>
  <div id="three">three</div>
  </div>\
  `;

              next(() => {
                this.respond();
                return up.replace('.middle', '/path#three', {reveal: true});
              });
                // response is already cached

              return next(() => {
                return expect(this.revealedText).toEqual(['two', 'three']);
            });}));

            return it("does not scroll if there is no element with the ID of that #hash", asyncSpec(function(next) {
              up.replace('.middle', '/path#hash', {reveal: true});
              this.responseText =
                `\
  <div class="middle">
  </div>\
  `;

              next(() => {
                return this.respond();
              });

              return next(() => {
                return expect(this.revealMock).not.toHaveBeenCalled();
              });
            })
            );
          });


          it('reveals a new element that is being appended', function(done) {
            const promise = up.replace('.middle:after', '/path', {reveal: true});
            this.respond();
            return promise.then(() => {
              expect(this.revealMock).not.toHaveBeenCalledWith(this.$oldMiddle[0]);
              // Text nodes are wrapped in a .up-insertion container so we can
              // animate them and measure their position/size for scrolling.
              // This is not possible for container-less text nodes.
              expect(this.revealedHTML).toEqual(['<div class="up-insertion">new-middle</div>']);
              // Show that the wrapper is done after the insertion.
              expect($('.up-insertion')).not.toBeAttached();
              return done();
            });
          });

          return it('reveals a new element that is being prepended', function(done) {
            const promise = up.replace('.middle:before', '/path', {reveal: true});
            this.respond();
            return promise.then(() => {
              expect(this.revealMock).not.toHaveBeenCalledWith(this.$oldMiddle[0]);
              // Text nodes are wrapped in a .up-insertion container so we can
              // animate them and measure their position/size for scrolling.
              // This is not possible for container-less text nodes.
              expect(this.revealedHTML).toEqual(['<div class="up-insertion">new-middle</div>']);
              // Show that the wrapper is done after the insertion.
              expect($('.up-insertion')).not.toBeAttached();
              return done();
            });
          });
        });

        return it('uses a { failTransition } option if the request failed');
      });

      return describeFallback('canPushState', () => it('makes a full page load', asyncSpec(function(next) {
        spyOn(up.browser, 'navigate');
        up.replace('.selector', '/path');

        return next(() => {
          return expect(up.browser.navigate).toHaveBeenCalledWith('/path', jasmine.anything());
        });
      })
      ));
    });

    describe('up.extract', function() {

      it('Updates a selector on the current page with the same selector from the given HTML string', asyncSpec(function(next) {

        $fixture('.before').text('old-before');
        $fixture('.middle').text('old-middle');
        $fixture('.after').text('old-after');

        const html =
          `\
  <div class="before">new-before</div>
  <div class="middle">new-middle</div>
  <div class="after">new-after</div>\
  `;

        up.extract('.middle', html);

        return next(function() {
          expect($('.before')).toHaveText('old-before');
          expect($('.middle')).toHaveText('new-middle');
          return expect($('.after')).toHaveText('old-after');
        });
      })
      );

      it("throws an error if the selector can't be found on the current page", function(done) {
        const html = '<div class="foo-bar">text</div>';
        const promise = up.extract('.foo-bar', html);
        return promiseState(promise).then(result => {
          expect(result.state).toEqual('rejected');
          expect(result.value).toMatch(/Could not find selector in current page, modal or popup/i);
          return done();
        });
      });

      it("throws an error if the selector can't be found in the given HTML string", function(done) {
        $fixture('.foo-bar');
        const promise = up.extract('.foo-bar', '');
        return promiseState(promise).then(result => {
          expect(result.state).toEqual('rejected');
          expect(result.value).toMatch(/Could not find selector in response/i);
          return done();
        });
      });

      it("ignores an element that matches the selector but also matches .up-destroying", function(done) {
        const html = '<div class="foo-bar">text</div>';
        $fixture('.foo-bar.up-destroying');
        const promise = up.extract('.foo-bar', html);
        return promiseState(promise).then(result => {
          expect(result.state).toEqual('rejected');
          expect(result.value).toMatch(/Could not find selector/i);
          return done();
        });
      });

      it("ignores an element that matches the selector but also has a parent matching .up-destroying", function(done) {
        const html = '<div class="foo-bar">text</div>';
        const $parent = $fixture('.up-destroying');
        const $child = $fixture('.foo-bar').appendTo($parent);
        const promise = up.extract('.foo-bar', html);
        return promiseState(promise).then(result => {
          expect(result.state).toEqual('rejected');
          expect(result.value).toMatch(/Could not find selector/i);
          return done();
        });
      });

      it('only replaces the first element matching the selector', asyncSpec(function(next) {
        const html = '<div class="foo-bar">text</div>';
        $fixture('.foo-bar');
        $fixture('.foo-bar');
        up.extract('.foo-bar', html);

        return next(() => {
          const $elements = $('.foo-bar');
          expect($($elements.get(0)).text()).toEqual('text');
          return expect($($elements.get(1)).text()).toEqual('');
        });
      })
      );

      it('focuses an [autofocus] element in the new fragment', asyncSpec(function(next) {
        $fixture('.foo-bar');
        up.extract('.foo-bar', `\
  <form class='foo-bar'>
  <input class="autofocused-input" autofocus>
  </form>\
  `
        );

        return next(() => {
          const input = $('.autofocused-input').get(0);
          expect(input).toBeGiven();
          return expect(document.activeElement).toBe(input);
        });
      })
      );


      // up.extract
      it('emits an up:fragment:destroyed event on the former parent element after the element has been removed from the DOM', function(done) {
        const $parent = $fixture('.parent');
        const $element = $parent.affix('.element.v1').text('v1');
        expect($element).toBeAttached();

        const spy = jasmine.createSpy('event listener');
        $parent[0].addEventListener('up:fragment:destroyed', event => spy(event.target, event.fragment, up.specUtil.isDetached($element)));

        const extractDone = up.extract('.element', '<div class="element v2">v2</div>');

        return extractDone.then(function() {
          expect(spy).toHaveBeenCalledWith($parent[0], $element[0], true);
          return done();
        });
      });

      describe('cleaning up', function() {

        it('calls destructors on the old element', asyncSpec(function(next) {
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.container', $element => () => destructor($element.text()));
          const $container = $fixture('.container').text('old text');
          up.hello($container);
          up.extract('.container', '<div class="container">new text</div>');

          return next(() => {
            expect('.container').toHaveText('new text');
            return expect(destructor).toHaveBeenCalledWith('old text');
          });
        })
        );

        it('calls destructors on the old element after a { transition }', function(done) {
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.container', $element => () => destructor($element.text()));
          const $container = $fixture('.container').text('old text');
          up.hello($container);

          up.extract('.container', '<div class="container">new text</div>', {transition: 'cross-fade', duration: 100});

          u.timer(50, () => {
            return expect(destructor).not.toHaveBeenCalled();
          });

          return u.timer(220, () => {
            expect('.container').toHaveText('new text');
            expect(destructor).toHaveBeenCalledWith('old text');
            return done();
          });
        });

        it('calls destructors when the replaced element is a singleton element like <body> (bugfix)', asyncSpec(function(next) {
          // shouldSwapElementsDirectly() is true for body, but can't have the example replace the Jasmine test runner UI
          up.element.knife.mock('isSingleton').and.callFake(element => e.matches(element, '.container'));
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.container', () => destructor);
          const $container = $fixture('.container');
          up.hello($container);
          up.extract('.container', '<div class="container">new text</div>');

          return next(() => {
            expect('.container').toHaveText('new text');
            return expect(destructor).toHaveBeenCalled();
          });
        })
        );

        it('marks the old element as .up-destroying before destructors', function(done) {
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.container', $element => () => destructor($element.text(), $element.is('.up-destroying')));
          const $container = $fixture('.container').text('old text');
          up.hello($container);

          const extractDone = up.extract('.container', '<div class="container">new text</div>');

          return extractDone.then(function() {
            expect('.container').toHaveText('new text');
            expect(destructor).toHaveBeenCalledWith('old text', true);
            return done();
          });
        });

        it('marks the old element as .up-destroying before destructors after a { transition }', function(done) {
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.container', $element => () => destructor($element.text(), $element.is('.up-destroying')));
          const $container = $fixture('.container').text('old text');
          up.hello($container);

          const extractDone = up.extract('.container', '<div class="container">new text</div>', {transition: 'cross-fade', duration: 100});

          return extractDone.then(function() {
            expect('.container').toHaveText('new text');
            expect(destructor).toHaveBeenCalledWith('old text', true);
            return done();
          });
        });

        it('calls destructors while the element is still attached to the DOM, so destructors see ancestry and events bubble up', asyncSpec(function(next) {
          const spy = jasmine.createSpy('parent spy');
          up.$compiler('.element', $element => () => spy($element.text(), $element.parent()));

          const $parent = $fixture('.parent');
          const $element = $parent.affix('.element').text('old text');
          up.hello($element);

          up.extract('.element', '<div class="element">new text</div>');

          return next(() => {
            return expect(spy).toHaveBeenCalledWith('old text', $parent);
          });
        })
        );

        return it('calls destructors while the element is still attached to the DOM when also using a { transition }', function(done) {
          const spy = jasmine.createSpy('parent spy');
          up.$compiler('.element', $element => () => // We must seek .parent in our ancestry, because our direct parent() is an .up-bounds container
          spy($element.text(), $element.closest('.parent')));

          const $parent = $fixture('.parent');
          const $element = $parent.affix('.element').text('old text');
          up.hello($element);

          const extractDone = up.extract('.element', '<div class="element">new text</div>', {transition: 'cross-fade', duration: 30});

          return extractDone.then(function() {
            expect(spy).toHaveBeenCalledWith('old text', $parent);
            return done();
          });
        });
      });


      describe('with { transition } option', function() {

        it('morphs between the old and new element', asyncSpec(function(next) {
          $fixture('.element.v1').text('version 1');
          up.extract('.element', '<div class="element v2">version 2</div>', {transition: 'cross-fade', duration: 200, easing: 'linear'});

          let $old = undefined;
          let $new = undefined;

          next(() => {
            $old = $('.element.v1');
            $new = $('.element.v2');

            expect($old).toHaveLength(1);
            expect($old).toHaveOpacity(1.0, 0.15);

            expect($new).toHaveLength(1);
            return expect($new).toHaveOpacity(0.0, 0.15);
          });

          next.after(100, () => {
            expect($old).toHaveOpacity(0.5, 0.3);
            return expect($new).toHaveOpacity(0.5, 0.3);
          });

          return next.after((100 + 70), () => {
            expect($new).toHaveOpacity(1.0, 0.1);
            return expect($old).toBeDetached();
          });
        })
        );


        it('ignores a { transition } option when replacing a singleton element like <body>', asyncSpec(function(next) {
          // shouldSwapElementsDirectly() is true for body, but can't have the example replace the Jasmine test runner UI
          spyOn(up.element, 'isSingleton').and.callFake(element => e.matches(element, '.container'));

          $fixture('.container').text('old text');

          const extractDone = jasmine.createSpy();
          const promise = up.extract('.container', '<div class="container">new text</div>', {transition: 'cross-fade', duration: 200});
          promise.then(extractDone);

          return next(() => {
            // See that we've already immediately swapped the element and ignored the duration of 200ms
            expect(extractDone).toHaveBeenCalled();
            expect($('.container').length).toEqual(1);
            return expect($('.container')).toHaveOpacity(1.0);
          });
        })
        );

        it('marks the old fragment as .up-destroying during the transition', asyncSpec(function(next) {
          $fixture('.element').text('version 1');
          up.extract('.element', '<div class="element">version 2</div>', {transition: 'cross-fade', duration: 200});

          return next(() => {
            const $version1 = $('.element:contains("version 1")');
            expect($version1).toHaveLength(1);
            expect($version1).toHaveClass('up-destroying');

            const $version2 = $('.element:contains("version 2")');
            expect($version2).toHaveLength(1);
            return expect($version2).not.toHaveClass('up-destroying');
          });
        })
        );

        // extract with { transition } option
        it('emits an up:fragment:destroyed event on the former parent element after the element has been removed from the DOM', function(done) {
          const $parent = $fixture('.parent');
          const $element = $parent.affix('.element.v1').text('v1');
          expect($element).toBeAttached();

          const spy = jasmine.createSpy('event listener');
          $parent[0].addEventListener('up:fragment:destroyed', event => spy(event.target, event.fragment, up.specUtil.isDetached($element)));

          const extractDone = up.extract('.element', '<div class="element v2">v2</div>', {transition: 'cross-fade', duration: 50});

          return extractDone.then(function() {
            expect(spy).toHaveBeenCalledWith($parent[0], $element[0], true);
            return done();
          });
        });


        it('cancels an existing transition by instantly jumping to the last frame', asyncSpec(function(next) {
          $fixture('.element.v1').text('version 1');

          up.extract('.element', '<div class="element v2">version 2</div>', {transition: 'cross-fade', duration: 200});

          next(() => {
            const $ghost1 = $('.element:contains("version 1")');
            expect($ghost1).toHaveLength(1);
            expect($ghost1.css('opacity')).toBeAround(1.0, 0.1);

            const $ghost2 = $('.element:contains("version 2")');
            expect($ghost2).toHaveLength(1);
            return expect($ghost2.css('opacity')).toBeAround(0.0, 0.1);
          });

          next(() => {
            return up.extract('.element', '<div class="element v3">version 3</div>', {transition: 'cross-fade', duration: 200});
          });

          return next(() => {
            const $ghost1 = $('.element:contains("version 1")');
            expect($ghost1).toHaveLength(0);

            const $ghost2 = $('.element:contains("version 2")');
            expect($ghost2).toHaveLength(1);
            expect($ghost2.css('opacity')).toBeAround(1.0, 0.1);

            const $ghost3 = $('.element:contains("version 3")');
            expect($ghost3).toHaveLength(1);
            return expect($ghost3.css('opacity')).toBeAround(0.0, 0.1);
          });
        })
        );


        it('delays the resolution of the returned promise until the transition is over', function(done) {
          $fixture('.element').text('version 1');
          const resolution = jasmine.createSpy();
          const promise = up.extract('.element', '<div class="element">version 2</div>', {transition: 'cross-fade', duration: 60});
          promise.then(resolution);
          expect(resolution).not.toHaveBeenCalled();

          u.timer(20, () => expect(resolution).not.toHaveBeenCalled());

          return u.timer(200, function() {
            expect(resolution).toHaveBeenCalled();
            return done();
          });
        });

        it('attaches the new element to the DOM before compilers are called, so they can see their parents and trigger bubbling events', asyncSpec(function(next){
          const $parent = $fixture('.parent');
          const $element = $parent.affix('.element').text('old text');
          const spy = jasmine.createSpy('parent spy');
          up.$compiler('.element', $element => spy($element.text(), $element.parent()));
          up.extract('.element', '<div class="element">new text</div>', {transition: 'cross-fade', duration: 50});

          return next(() => {
            return expect(spy).toHaveBeenCalledWith('new text', $parent);
          });
        })
        );


        describe('when up.morph() is called from a transition function', function() {

          it("does not emit multiple replacement events (bugfix)", function(done) {
            const $element = $fixture('.element').text('old content');

            const transition = (oldElement, newElement, options) => up.morph(oldElement, newElement, 'cross-fade', options);

            const destroyedListener = jasmine.createSpy('listener to up:fragment:destroyed');
            up.on('up:fragment:destroyed', destroyedListener);
            const insertedListener = jasmine.createSpy('listener to up:fragment:inserted');
            up.on('up:fragment:inserted', insertedListener);

            const extractDone = up.extract('.element', '<div class="element">new content</div>', {transition, duration: 50, easing: 'linear'});

            return extractDone.then(function() {
              expect(destroyedListener.calls.count()).toBe(1);
              expect(insertedListener.calls.count()).toBe(1);
              return done();
            });
          });

          it("does not compile the element multiple times (bugfix)", function(done) {
            const $element = $fixture('.element').text('old content');

            const transition = (oldElement, newElement, options) => up.morph(oldElement, newElement, 'cross-fade', options);

            const compiler = jasmine.createSpy('compiler');
            up.$compiler('.element', compiler);

            const extractDone = up.extract('.element', '<div class="element">new content</div>', {transition, duration: 50, easing: 'linear'});

            return extractDone.then(function() {
              expect(compiler.calls.count()).toBe(1);
              return done();
            });
          });

          return it("does not call destructors multiple times (bugfix)", function(done) {
            const $element = $fixture('.element').text('old content');

            const transition = (oldElement, newElement, options) => up.morph(oldElement, newElement, 'cross-fade', options);

            const destructor = jasmine.createSpy('destructor');
            up.$compiler('.element', element => destructor);

            up.hello($element);

            const extractDone = up.extract('.element', '<div class="element">new content</div>', {transition, duration: 50, easing: 'linear'});

            return extractDone.then(function() {
              expect(destructor.calls.count()).toBe(1);
              return done();
            });
          });
        });


        return describe('when animation is disabled', function() {

          beforeEach(() => up.motion.config.enabled = false);

          it('immediately swaps the old and new elements without creating unnecessary ghosts', asyncSpec(function(next) {
            $fixture('.element').text('version 1');
            up.extract('.element', '<div class="element">version 2</div>', {transition: 'cross-fade', duration: 200});
            return next(() => {
              expect($('.element')).toHaveText('version 2');
              return expect($('.up-ghost')).toHaveLength(0);
            });
          })
          );

          return it("replaces the elements directly, since first inserting and then removing would shift scroll positions", asyncSpec(function(next) {
            const swapDirectlySpy = up.motion.knife.mock('swapElementsDirectly');
            $fixture('.element').text('version 1');
            up.extract('.element', '<div class="element">version 2</div>', {transition: false});

            return next(() => {
              return expect(swapDirectlySpy).toHaveBeenCalled();
            });
          })
          );
        });
      });

      describe('with { scrollBehavior } option', function() {

        beforeEach(function() {
          return up.viewport.knife.mock('reveal').and.callFake((element, options) => {
            return this.revealScrollBehavior = options.behavior != null ? options.behavior : options.scrollBehavior;
          });
        });

        it('animates the revealing when prepending an element', asyncSpec(function(next) {
          fixture('.element', {text: 'version 1'});
          up.extract('.element:before', '<div class="element">version 2</div>', {reveal: true, scrollBehavior: 'smooth'});
          return next(() => {
            return expect(this.revealScrollBehavior).toEqual('smooth');
          });
        })
        );

        it('animates the revealing when appending an element', asyncSpec(function(next) {
          fixture('.element', {text: 'version 1'});
          up.extract('.element:after', '<div class="element">version 2</div>', {reveal: true, scrollBehavior: 'smooth'});
          return next(() => {
            return expect(this.revealScrollBehavior).toEqual('smooth');
          });
        })
        );

        return it('does not animate the revealing when swapping out an element', asyncSpec(function(next) {
          fixture('.element', {text: 'version 1'});
          up.extract('.element', '<div class="element">version 2</div>', {reveal: true, scrollBehavior: 'smooth'});
          return next(() => {
            return expect(this.revealScrollBehavior).toEqual('auto');
          });
        })
        );
      });

      return describe('handling of [up-keep] elements', function() {

        const squish = function(string) {
          if (u.isString(string)) {
            string = string.replace(/^\s+/g, '');
            string = string.replace(/\s+$/g, '');
            string = string.replace(/\s+/g, ' ');
          }
          return string;
        };

        beforeEach(() => // Need to refactor this spec file so examples don't all share one example
        $('.before, .middle, .after').remove());

        it('keeps an [up-keep] element, but does replace other elements around it', asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.affix('.before').text('old-before');
          $container.affix('.middle[up-keep]').text('old-middle');
          $container.affix('.after').text('old-after');

          up.extract('.container', `\
  <div class='container'>
  <div class='before'>new-before</div>
  <div class='middle' up-keep>new-middle</div>
  <div class='after'>new-after</div>
  </div>\
  `
          );

          return next(() => {
            expect($('.before')).toHaveText('new-before');
            expect($('.middle')).toHaveText('old-middle');
            return expect($('.after')).toHaveText('new-after');
          });
        })
        );

        it('keeps an [up-keep] element, but does replace text nodes around it', asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.html(`\
  old-before
  <div class='element' up-keep>old-inside</div>
  old-after\
  `
          );

          up.extract('.container', `\
  <div class='container'>
  new-before
  <div class='element' up-keep>new-inside</div>
  new-after
  </div>\
  `
          );

          return next(() => {
            return expect(squish($('.container').text())).toEqual('new-before old-inside new-after');
          });
        })
        );

        it('updates an [up-keep] element with { keep: false } option', asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.html(`\
  old-before
  <div class='element' up-keep>old-inside</div>
  old-after\
  `
          );

          up.extract('.container', `\
  <div class='container'>
  new-before
  <div class='element' up-keep>new-inside</div>
  new-after
  </div>\
  `,
            {keep: false});

          return next(() => {
            return expect(squish($('.container').text())).toEqual('new-before new-inside new-after');
          });
        })
        );

        describe('if an [up-keep] element is itself a direct replacement target', function() {

          it("keeps that element", asyncSpec(function(next) {
            $fixture('.keeper[up-keep]').text('old-inside');
            up.extract('.keeper', "<div class='keeper' up-keep>new-inside</div>");

            return next(() => {
              return expect($('.keeper')).toHaveText('old-inside');
            });
          })
          );

          return it("only emits an event up:fragment:kept, but not an event up:fragment:inserted", asyncSpec(function(next) {
            const insertedListener = jasmine.createSpy('subscriber to up:fragment:inserted');
            const keptListener = jasmine.createSpy('subscriber to up:fragment:kept');
            up.on('up:fragment:kept', keptListener);
            up.on('up:fragment:inserted', insertedListener);
            const $keeper = $fixture('.keeper[up-keep]').text('old-inside');
            up.extract('.keeper', "<div class='keeper new' up-keep>new-inside</div>");

            return next(() => {
              expect(insertedListener).not.toHaveBeenCalled();
              return expect(keptListener).toHaveBeenCalledWith(
                jasmine.objectContaining({newFragment: jasmine.objectContaining({className: 'keeper new'})}),
                $keeper[0],
                jasmine.anything()
              );
            });
          })
          );
        });

        it("removes an [up-keep] element if no matching element is found in the response", asyncSpec(function(next) {
          const barCompiler = jasmine.createSpy();
          const barDestructor = jasmine.createSpy();
          up.$compiler('.bar', function($bar) {
            const text = $bar.text();
            barCompiler(text);
            return () => barDestructor(text);
          });

          const $container = $fixture('.container');
          $container.html(`\
  <div class='foo'>old-foo</div>
  <div class='bar' up-keep>old-bar</div>\
  `
          );
          up.hello($container);

          expect(barCompiler.calls.allArgs()).toEqual([['old-bar']]);
          expect(barDestructor.calls.allArgs()).toEqual([]);

          up.extract('.container', `\
  <div class='container'>
  <div class='foo'>new-foo</div>
  </div>\
  `
          );

          return next(() => {
            expect($('.container .foo')).toBeAttached();
            expect($('.container .bar')).not.toBeAttached();

            expect(barCompiler.calls.allArgs()).toEqual([['old-bar']]);
            return expect(barDestructor.calls.allArgs()).toEqual([['old-bar']]);
        });}));

        it("updates an element if a matching element is found in the response, but that other element is no longer [up-keep]", asyncSpec(function(next) {
          const barCompiler = jasmine.createSpy();
          const barDestructor = jasmine.createSpy();
          up.$compiler('.bar', function($bar) {
            const text = $bar.text();
            barCompiler(text);
            return () => barDestructor(text);
          });

          const $container = $fixture('.container');
          $container.html(`\
  <div class='foo'>old-foo</div>
  <div class='bar' up-keep>old-bar</div>\
  `
          );
          up.hello($container);

          expect(barCompiler.calls.allArgs()).toEqual([['old-bar']]);
          expect(barDestructor.calls.allArgs()).toEqual([]);

          up.extract('.container', `\
  <div class='container'>
  <div class='foo'>new-foo</div>
  <div class='bar'>new-bar</div>
  </div>\
  `
          );

          return next(() => {
            expect($('.container .foo')).toHaveText('new-foo');
            expect($('.container .bar')).toHaveText('new-bar');

            expect(barCompiler.calls.allArgs()).toEqual([['old-bar'], ['new-bar']]);
            return expect(barDestructor.calls.allArgs()).toEqual([['old-bar']]);
        });}));

        it('moves a kept element to the ancestry position of the matching element in the response', asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.html(`\
  <div class="parent1">
  <div class="keeper" up-keep>old-inside</div>
  </div>
  <div class="parent2">
  </div>\
  `
          );
          up.extract('.container', `\
  <div class='container'>
  <div class="parent1">
  </div>
  <div class="parent2">
    <div class="keeper" up-keep>old-inside</div>
  </div>
  </div>\
  `
          );

          return next(() => {
            expect($('.keeper')).toHaveText('old-inside');
            return expect($('.keeper').parent()).toEqual($('.parent2'));
          });
        })
        );

        it('lets developers choose a selector to match against as the value of the up-keep attribute', asyncSpec(function(next) {
          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep=".stayer"></div>\
  `
          );
          up.extract('.container', `\
  <div class='container'>
  <div up-keep class="stayer"></div>
  </div>\
  `
          );

          return next(() => {
            return expect('.keeper').toBeAttached();
          });
        })
        );

        it('does not compile a kept element a second time', asyncSpec(function(next) {
          const compiler = jasmine.createSpy('compiler');
          up.$compiler('.keeper', compiler);
          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep>old-text</div>\
  `
          );

          up.hello($container);
          expect(compiler.calls.count()).toEqual(1);

          up.extract('.container', `\
  <div class='container'>
  <div class="keeper" up-keep>new-text</div>
  </div>\
  `
          );

          return next(() => {
            expect(compiler.calls.count()).toEqual(1);
            return expect('.keeper').toBeAttached();
          });
        })
        );

        it('does not lose jQuery event handlers on a kept element (bugfix)', asyncSpec(function(next) {
          const handler = jasmine.createSpy('event handler');
          up.$compiler('.keeper', $keeper => $keeper.on('click', handler));

          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep>old-text</div>\
  `
          );
          up.hello($container);

          up.extract('.container', `\
  <div class='container'>
  <div class="keeper" up-keep>new-text</div>
  </div>\
  `
          );

          next(() => {
            return expect('.keeper').toHaveText('old-text');
          });

          next(() => {
            return Trigger.click('.keeper');
          });

          return next(() => {
            return expect(handler).toHaveBeenCalled();
          });
        })
        );

        it('does not call destructors on a kept alement', asyncSpec(function(next) {
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.keeper', $keeper => destructor);

          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep>old-text</div>\
  `
          );
          up.hello($container);

          up.extract('.container', `\
  <div class='container'>
  <div class="keeper" up-keep>new-text</div>
  </div>\
  `
          );

          return next(() => {
            const $keeper = $('.keeper');
            expect($keeper).toHaveText('old-text');
            return expect(destructor).not.toHaveBeenCalled();
          });
        })
        );

        it('calls destructors when a kept element is eventually removed from the DOM', asyncSpec(function(next) {
          const handler = jasmine.createSpy('event handler');
          const destructor = jasmine.createSpy('destructor');
          up.$compiler('.keeper', $keeper => destructor);

          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep>old-text</div>\
  `
          );
          up.hello($container);

          up.extract('.container', `\
  <div class='container'>
  <div class="keeper">new-text</div>
  </div>\
  `
          );

          return next(() => {
            const $keeper = $('.keeper');
            expect($keeper).toHaveText('new-text');
            return expect(destructor).toHaveBeenCalled();
          });
        })
        );

        it('lets listeners inspect a new element before discarding through properties on an up:fragment:keep event', asyncSpec(function(next) {
          const $keeper = $fixture('.keeper[up-keep]').text('old-inside');
          const listener = jasmine.createSpy('event listener');
          $keeper[0].addEventListener('up:fragment:keep', listener);
          up.extract('.keeper', "<div class='keeper new' up-keep up-data='{ \"key\": \"new-value\" }'>new-inside</div>");
          return next(() => {
            return expect(listener).toHaveBeenCalledWith(
              jasmine.objectContaining({
                newFragment: jasmine.objectContaining({className: 'keeper new'}),
                newData: { key: 'new-value' },
                target: $keeper[0]
              })
            );
          });
        })
        );

        it('lets listeners cancel the keeping by preventing default on an up:fragment:keep event', asyncSpec(function(next) {
          const $keeper = $fixture('.keeper[up-keep]').text('old-inside');
          $keeper.on('up:fragment:keep', event => event.preventDefault());
          up.extract('.keeper', "<div class='keeper' up-keep>new-inside</div>");
          return next(() => expect($('.keeper')).toHaveText('new-inside'));
        })
        );

        it('lets listeners prevent up:fragment:keep event if the element was kept before (bugfix)', asyncSpec(function(next) {
          const $keeper = $fixture('.keeper[up-keep]').text('version 1');
          $keeper[0].addEventListener('up:fragment:keep', function(event) {
            if (event.newFragment.textContent.trim() === 'version 3') { return event.preventDefault(); }
          });

          next(() => up.extract('.keeper', "<div class='keeper' up-keep>version 2</div>"));
          next(() => expect($('.keeper')).toHaveText('version 1'));
          next(() => up.extract('.keeper', "<div class='keeper' up-keep>version 3</div>"));
          return next(() => expect($('.keeper')).toHaveText('version 3'));
        })
        );

        it('emits an up:fragment:kept event on a kept element and up:fragment:inserted on the targeted parent parent', asyncSpec(function(next) {
          const insertedListener = jasmine.createSpy();
          up.on('up:fragment:inserted', insertedListener);
          const keptListener = jasmine.createSpy();
          up.on('up:fragment:kept', keptListener);

          const $container = $fixture('.container');
          $container.html(`\
  <div class="keeper" up-keep></div>\
  `
          );

          up.extract('.container', `\
  <div class='container'>
  <div class="keeper" up-keep></div>
  </div>\
  `
          );

          return next(() => {
            expect(insertedListener).toHaveBeenCalledWith(jasmine.anything(), $('.container')[0], jasmine.anything());
            return expect(keptListener).toHaveBeenCalledWith(jasmine.anything(), $('.container .keeper')[0], jasmine.anything());
          });
        })
        );

        it('emits an up:fragment:kept event on a kept element with a newData property corresponding to the up-data attribute value of the discarded element', asyncSpec(function(next) {
          const keptListener = jasmine.createSpy();
          up.on('up:fragment:kept', event => keptListener(event.target, event.newData));
          const $container = $fixture('.container');
          const $keeper = $container.affix('.keeper[up-keep]').text('old-inside');

          up.extract('.container', `\
  <div class='container'>
  <div class='keeper' up-keep up-data='{ "foo": "bar" }'>new-inside</div>
  </div>\
  `
          );

          return next(() => {
            expect($('.keeper')).toHaveText('old-inside');
            return expect(keptListener).toHaveBeenCalledWith($keeper[0], { 'foo': 'bar' });
          });
        })
        );

        it('emits an up:fragment:kept with { newData: {} } if the discarded element had no up-data value', asyncSpec(function(next) {
          const keptListener = jasmine.createSpy();
          up.on('up:fragment:kept', keptListener);
          const $container = $fixture('.container');
          const $keeper = $container.affix('.keeper[up-keep]').text('old-inside');
          up.extract('.keeper', `\
  <div class='container'>
  <div class='keeper' up-keep>new-inside</div>
  </div>\
  `
          );

          return next(() => {
            expect($('.keeper')).toHaveText('old-inside');
            return expect(keptListener).toEqual(jasmine.anything(), $('.keeper'), {});
          });
        })
        );

        it('reuses the same element and emits up:fragment:kept during multiple extractions', asyncSpec(function(next) {
          const keptListener = jasmine.createSpy();
          up.on('up:fragment:kept', event => keptListener(event.target, event.newData));
          const $container = $fixture('.container');
          let $keeper = $container.affix('.keeper[up-keep]').text('old-inside');

          next(() => {
            return up.extract('.keeper', `\
  <div class='container'>
  <div class='keeper' up-keep up-data='{ \"key\": \"value1\" }'>new-inside</div>
  </div>\
  `
            );
          });

          next(() => {
            return up.extract('.keeper', `\
  <div class='container'>
  <div class='keeper' up-keep up-data='{ \"key\": \"value2\" }'>new-inside</div>\
  `
            );
          });

          return next(() => {
            $keeper = $('.keeper');
            expect($keeper).toHaveText('old-inside');
            expect(keptListener).toHaveBeenCalledWith($keeper[0], { key: 'value1' });
            return expect(keptListener).toHaveBeenCalledWith($keeper[0], { key: 'value2' });
          });
        })
        );

        return it("doesn't let the discarded element appear in a transition", function(done) {
          let oldTextDuringTransition = undefined;
          let newTextDuringTransition = undefined;
          const transition = function(oldElement, newElement) {
            oldTextDuringTransition = squish(oldElement.innerText);
            newTextDuringTransition = squish(newElement.innerText);
            return Promise.resolve();
          };
          const $container = $fixture('.container');
          $container.html(`\
  <div class='foo'>old-foo</div>
  <div class='bar' up-keep>old-bar</div>\
  `
          );
          const newHtml = `\
  <div class='container'>
  <div class='foo'>new-foo</div>
  <div class='bar' up-keep>new-bar</div>
  </div>\
  `;
          const promise = up.extract('.container', newHtml, {transition});
          return promise.then(function() {
            expect(oldTextDuringTransition).toEqual('old-foo old-bar');
            expect(newTextDuringTransition).toEqual('new-foo old-bar');
            return done();
          });
        });
      });
    });



    describe('up.destroy', function() {

      it('removes the element with the given selector', function(done) {
        $fixture('.element');
        return up.destroy('.element').then(function() {
          expect($('.element')).not.toBeAttached();
          return done();
        });
      });

      it('runs an animation before removal with { animate } option', asyncSpec(function(next) {
        const $element = $fixture('.element');
        up.destroy($element, {animation: 'fade-out', duration: 200, easing: 'linear'});

        next(() => expect($element).toHaveOpacity(1.0, 0.15));

        next.after(100, () => expect($element).toHaveOpacity(0.5, 0.3));

        return next.after((100 + 75), () => expect($element).toBeDetached());
      })
      );

      it('calls destructors for custom elements', function(done) {
        up.$compiler('.element', $element => destructor);
        var destructor = jasmine.createSpy('destructor');
        up.hello(fixture('.element'));
        return up.destroy('.element').then(function() {
          expect(destructor).toHaveBeenCalled();
          return done();
        });
      });

      it('marks the old element as .up-destroying before destructors', function(done) {
        const destructor = jasmine.createSpy('destructor');
        up.$compiler('.container', $element => () => destructor($element.text(), $element.is('.up-destroying')));
        const $container = $fixture('.container').text('old text');
        up.hello($container);

        const destroyDone = up.destroy('.container');

        return destroyDone.then(function() {
          expect(destructor).toHaveBeenCalledWith('old text', true);
          return done();
        });
      });

      it('marks the old element as .up-destroying before destructors after an { animation }', function(done) {
        const destructor = jasmine.createSpy('destructor');
        up.$compiler('.container', $element => () => destructor($element.text(), $element.is('.up-destroying')));
        const $container = $fixture('.container').text('old text');
        up.hello($container);

        const destroyDone = up.destroy('.container', {animation: 'fade-out', duration: 100});

        return destroyDone.then(function() {
          expect(destructor).toHaveBeenCalledWith('old text', true);
          return done();
        });
      });

      it('waits until an { animation } is done before calling destructors', asyncSpec(function(next) {
        const destructor = jasmine.createSpy('destructor');
        up.$compiler('.container', $element => () => destructor($element.text()));
        const $container = $fixture('.container').text('old text');
        up.hello($container);

        const destroyDone = up.destroy('.container', {animation: 'fade-out', duration: 200});

        next.after(100, function() {
          expect(destructor).not.toHaveBeenCalled();

          return next.await(destroyDone);
        });

        return next(() => expect(destructor).toHaveBeenCalledWith('old text'));
      })
      );


      it('allows to pass a new history entry as { history } option', function(done) {
        up.history.config.enabled = true;
        $fixture('.element');
        return up.destroy('.element', {history: '/new-path'}).then(() => u.timer(100, function() {
          expect(location.href).toMatchUrl('/new-path');
          return done();
        }));
      });

      it('allows to pass a new document title as { title } option', function(done) {
        up.history.config.enabled = true;
        $fixture('.element');
        return up.destroy('.element', {history: '/new-path', title: 'Title from options'}).then(function() {
          expect(document.title).toEqual('Title from options');
          return done();
        });
      });

      it('marks the element as .up-destroying while it is animating', asyncSpec(function(next) {
        const $element = $fixture('.element');
        up.destroy($element, {animation: 'fade-out', duration: 80, easing: 'linear'});

        return next(() => expect($element).toHaveClass('up-destroying'));
      })
      );

      // up.destroy
      it('emits an up:fragment:destroyed event on the former parent element after the element has been removed from the DOM', asyncSpec(function(next) {
        const $parent = $fixture('.parent');
        const $element = $parent.affix('.element');
        expect($element).toBeAttached();

        const listener = jasmine.createSpy('event listener');

        $parent[0].addEventListener('up:fragment:destroyed', listener);

        const destroyDone = up.destroy($element, {animation: 'fade-out', duration: 30});

        next(function() {
          expect(listener).not.toHaveBeenCalled();
          expect($element).toBeAttached();

          return next.await(destroyDone);
        });

        return next(function() {
          expect(listener).toHaveBeenCalledWith(
            jasmine.objectContaining({
              target: $parent[0],
              parent: $parent[0],
              fragment: $element[0]
            })
          );
          return expect($element).toBeDetached();
        });
      })
      );

      return it('removes element-related data from the global jQuery cache (bugfix)', asyncSpec(function(next) {
        const $element = $fixture('.element');
        $element.data('foo', { foo: '1' });
        expect($element.data('foo')).toEqual({ foo: '1'});
        up.destroy($element);

        return next(() => expect($element.data('foo')).toBeMissing());
      })
      );
    });

    describe('up.reload', function() {

      describeCapability('canPushState', () => it('reloads the given selector from the closest known source URL', asyncSpec(function(next) {
        $fixture('.container[up-source="/source"] .element').find('.element').text('old text');

        next(() => {
          return up.reload('.element');
        });

        next(() => {
          expect(this.lastRequest().url).toMatch(/\/source$/);
          return this.respondWith(`\
  <div class="container">
  <div class="element">new text</div>
  </div>\
  `
          );
        });

        return next(() => {
          return expect($('.element')).toHaveText('new text');
        });
      })
      ));


      return describeFallback('canPushState', () => it('makes a page load from the closest known source URL', asyncSpec(function(next) {
        $fixture('.container[up-source="/source"] .element').find('.element').text('old text');
        spyOn(up.browser, 'navigate');
        up.reload('.element');

        return next(() => {
          return expect(up.browser.navigate).toHaveBeenCalledWith('/source', jasmine.anything());
        });
      })
      ));
    });

    return describe('up.fragment.layerOf', function() {

      it('returns "popup" for an element in a popup over the page', function() {
        const $popup = $fixture('.up-popup');
        const $element = $popup.affix('.element');
        return expect(up.fragment.layerOf($element[0])).toEqual('popup');
      });

      it('returns "popup" for an element in a popup over a modal', function() {
        const $modal = $fixture('.up-modal');
        const $popupInModal = $modal.affix('.up-popup');
        const $element = $popupInModal.affix('.element');
        return expect(up.fragment.layerOf($element[0])).toEqual('popup');
      });

      it('returns "modal" for an element in a modal', function() {
        const $modal = $fixture('.up-modal');
        const $element = $modal.affix('.element');
        return expect(up.fragment.layerOf($element[0])).toEqual('modal');
      });

      return it('returns "page" for an element below a modal or popup', function() {
        const $element = $fixture('.element');
        return expect(up.fragment.layerOf($element[0])).toEqual('page');
      });
    });
  }));
})();
