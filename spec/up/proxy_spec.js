/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.proxy', function() {

    describe('JavaScript functions', function() {

      describe('up.request', function() {

        it('makes a request with the given URL and params', function() {
          up.request('/foo', {params: { key: 'value' }, method: 'post'});
          const request = this.lastRequest();
          expect(request.url).toMatchUrl('/foo');
          expect(request.data()).toEqual({key: ['value']});
          return expect(request.method).toEqual('POST');
        });

        it('also allows to pass the URL as a { url } option instead', function() {
          up.request({url: '/foo', params: { key: 'value' }, method: 'post'});
          const request = this.lastRequest();
          expect(request.url).toMatchUrl('/foo');
          expect(request.data()).toEqual({key: ['value']});
          return expect(request.method).toEqual('POST');
        });

        it('allows to pass in an up.Request instance instead of an options object', function() {
          const requestArg = new up.Request({url: '/foo', params: { key: 'value' }, method: 'post'});
          up.request(requestArg);

          const jasmineRequest = this.lastRequest();
          expect(jasmineRequest.url).toMatchUrl('/foo');
          expect(jasmineRequest.data()).toEqual({key: ['value']});
          return expect(jasmineRequest.method).toEqual('POST');
        });

        it('submits the replacement targets as HTTP headers, so the server may choose to only frender the requested fragments', asyncSpec(function(next) {
          up.request({url: '/foo', target: '.target', failTarget: '.fail-target'});

          return next(() => {
            const request = this.lastRequest();
            expect(request.requestHeaders['X-Up-Target']).toEqual('.target');
            return expect(request.requestHeaders['X-Up-Fail-Target']).toEqual('.fail-target');
          });
        })
        );

        it('resolves to a Response object that contains information about the response and request', function(done) {
          const promise = up.request({
            url: '/url',
            params: { key: 'value' },
            method: 'post',
            target: '.target'
          });

          return u.task(() => {
            this.respondWith({
              status: 201,
              responseText: 'response-text'
            });

            return promise.then(function(response) {
              expect(response.request.url).toMatchUrl('/url');
              expect(response.request.params).toEqual(new up.Params({key: 'value'}));
              expect(response.request.method).toEqual('POST');
              expect(response.request.target).toEqual('.target');
              expect(response.request.hash).toBeBlank();

              expect(response.url).toMatchUrl('/url'); // If the server signaled a redirect with X-Up-Location, this would be reflected here
              expect(response.method).toEqual('POST'); // If the server sent a X-Up-Method header, this would be reflected here
              expect(response.text).toEqual('response-text');
              expect(response.status).toEqual(201);
              expect(response.xhr).toBePresent();

              return done();
            });
          });
        });

        it('resolves to a Response that contains the response headers', function(done) {
          const promise = up.request({url: '/url'});

          u.task(() => {
            return this.respondWith({
              responseHeaders: { 'foo': 'bar', 'baz': 'bam' },
              responseText: 'hello'
            });
          });

          return promise.then(function(response) {
            expect(response.getHeader('foo')).toEqual('bar');

            // Lookup is case-insensitive
            expect(response.getHeader('BAZ')).toEqual('bam');

            return done();
          });
        });

        it("preserves the URL hash in a separate { hash } property, since although it isn't sent to server, code might need it to process the response", function(done) {
          const promise = up.request('/url#hash');

          return u.task(() => {
            const request = this.lastRequest();
            expect(request.url).toMatchUrl('/url');

            this.respondWith('response-text');

            return promise.then(function(response) {
              expect(response.request.url).toMatchUrl('/url');
              expect(response.request.hash).toEqual('#hash');
              expect(response.url).toMatchUrl('/url');
              return done();
            });
          });
        });

        describe('when the server responds with an X-Up-Method header', () => it('updates the { method } property in the response object', function(done) {
          const promise = up.request({
            url: '/url',
            params: { key: 'value' },
            method: 'post',
            target: '.target'
          });

          return u.task(() => {
            this.respondWith({
              responseHeaders: {
                'X-Up-Location': '/redirect',
                'X-Up-Method': 'GET'
              }
            });

            return promise.then(function(response) {
              expect(response.request.url).toMatchUrl('/url');
              expect(response.request.method).toEqual('POST');
              expect(response.url).toMatchUrl('/redirect');
              expect(response.method).toEqual('GET');
              return done();
            });
          });
        }));

        describe('when the server responds with an X-Up-Location header', function() {

          it('sets the { url } property on the response object', function(done) {
            const promise = up.request('/request-url#request-hash');

            return u.task(() => {
              this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/response-url'
                }
              });

              return promise.then(function(response) {
                expect(response.request.url).toMatchUrl('/request-url');
                expect(response.request.hash).toEqual('#request-hash');
                expect(response.url).toMatchUrl('/response-url');
                return done();
              });
            });
          });

          it('considers a redirection URL an alias for the requested URL', asyncSpec(function(next) {
            up.request('/foo');

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/bar',
                  'X-Up-Method': 'GET'
                }
              });
            });

            next(() => {
              return up.request('/bar');
            });

            return next(() => {
              // See that the cached alias is used and no additional requests are made
              return expect(jasmine.Ajax.requests.count()).toEqual(1);
            });
          })
          );

          it('does not considers a redirection URL an alias for the requested URL if the original request was never cached', asyncSpec(function(next) {
            up.request('/foo', {method: 'post'}); // POST requests are not cached

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/bar',
                  'X-Up-Method': 'GET'
                }
              });
            });

            next(() => {
              return up.request('/bar');
            });

            return next(() => {
              // See that an additional request was made
              return expect(jasmine.Ajax.requests.count()).toEqual(2);
            });
          })
          );

          it('does not considers a redirection URL an alias for the requested URL if the response returned a non-200 status code', asyncSpec(function(next) {
            up.request('/foo');

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/bar',
                  'X-Up-Method': 'GET'
                },
                status: 500
              });
            });

            next(() => {
              return up.request('/bar');
            });

            return next(() => {
              // See that an additional request was made
              return expect(jasmine.Ajax.requests.count()).toEqual(2);
            });
          })
          );

          return describeCapability('canInspectFormData', () => it("does not explode if the original request's { params } is a FormData object", asyncSpec(function(next) {
            up.request('/foo', {method: 'post', params: new FormData()}); // POST requests are not cached

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseHeaders: {
                  'X-Up-Location': '/bar',
                  'X-Up-Method': 'GET'
                }
              });
            });

            next(() => {
              return this.secondAjaxPromise = up.request('/bar');
            });

            return next.await(() => {
              return promiseState(this.secondAjaxPromise).then(result => // See that the promise was not rejected due to an internal error.
              expect(result.state).toEqual('pending'));
            });
          })
          ));
        });


        describe('when the XHR object has a { responseURL } property', function() {

          it('sets the { url } property on the response object', function(done) {
            const promise = up.request('/request-url#request-hash');

            return u.task(() => {
              this.respondWith({
                responseURL: '/response-url'});

              return promise.then(function(response) {
                expect(response.request.url).toMatchUrl('/request-url');
                expect(response.request.hash).toEqual('#request-hash');
                expect(response.url).toMatchUrl('/response-url');
                return done();
              });
            });
          });

          it('considers a redirection URL an alias for the requested URL', asyncSpec(function(next) {
            up.request('/foo');

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseURL: '/bar'});
            });

            next(() => {
              return up.request('/bar');
            });

            return next(() => {
              // See that the cached alias is used and no additional requests are made
              return expect(jasmine.Ajax.requests.count()).toEqual(1);
            });
          })
          );

          it('does not considers a redirection URL an alias for the requested URL if the original request was never cached', asyncSpec(function(next) {
            up.request('/foo', {method: 'post'}); // POST requests are not cached

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseURL: '/bar'});
            });

            next(() => {
              return up.request('/bar');
            });

            return next(() => {
              // See that an additional request was made
              return expect(jasmine.Ajax.requests.count()).toEqual(2);
            });
          })
          );

          return it('does not considers a redirection URL an alias for the requested URL if the response returned a non-200 status code', asyncSpec(function(next) {
            up.request('/foo');

            next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              return this.respondWith({
                responseURL: '/bar',
                status: 500
              });
            });

            return next(() => {
              return up.request('/bar');
            });
          })
          );
        });


        describe('CSRF', function() {

          beforeEach(function() {
            up.protocol.config.csrfHeader = 'csrf-header';
            return up.protocol.config.csrfToken = 'csrf-token';
          });

          it('sets a CSRF token in the header', asyncSpec(function(next) {
            up.request('/path', {method: 'post'});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['csrf-header']).toEqual('csrf-token');
            });
          })
          );

          it('does not add a CSRF token if there is none', asyncSpec(function(next) {
            up.protocol.config.csrfToken = '';
            up.request('/path', {method: 'post'});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['csrf-header']).toBeMissing();
            });
          })
          );

          it('does not add a CSRF token for GET requests', asyncSpec(function(next) {
            up.request('/path', {method: 'get'});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['csrf-header']).toBeMissing();
            });
          })
          );

          return it('does not add a CSRF token when loading content from another domain', asyncSpec(function(next) {
            up.request('http://other-domain.tld/path', {method: 'post'});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['csrf-header']).toBeMissing();
            });
          })
          );
        });

        describe('X-Requested-With header', function() {

          it('sets the header to "XMLHttpRequest" by default', asyncSpec(function(next) {
            up.request('/path', {method: 'post'});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['X-Requested-With']).toEqual('XMLHttpRequest');
            });
          })
          );

          return it('does not overrride an existing X-Requested-With header', asyncSpec(function(next) {
            up.request('/path', {method: 'post', headers: { 'X-Requested-With': 'Love' }});
            return next(() => {
              const headers = this.lastRequest().requestHeaders;
              return expect(headers['X-Requested-With']).toEqual('Love');
            });
          })
          );
        });

        describe('with { params } option', function() {

          it("uses the given params as a non-GET request's payload", asyncSpec(function(next) {
            const givenParams = { 'foo-key': 'foo-value', 'bar-key': 'bar-value' };
            up.request({url: '/path', method: 'put', params: givenParams});

            return next(() => {
              expect(this.lastRequest().data()['foo-key']).toEqual(['foo-value']);
              return expect(this.lastRequest().data()['bar-key']).toEqual(['bar-value']);
            });
          })
          );

          return it("encodes the given params into the URL of a GET request", function(done) {
            const givenParams = { 'foo-key': 'foo-value', 'bar-key': 'bar-value' };
            const promise = up.request({url: '/path', method: 'get', params: givenParams});

            return u.task(() => {
              expect(this.lastRequest().url).toMatchUrl('/path?foo-key=foo-value&bar-key=bar-value');
              expect(this.lastRequest().data()).toBeBlank();

              this.respondWith('response-text');

              return promise.then(function(response) {
                // See that the response object has been updated by moving the data options
                // to the URL. This is important for up.fragment code that works on response.request.
                expect(response.request.url).toMatchUrl('/path?foo-key=foo-value&bar-key=bar-value');
                expect(response.request.params).toBeBlank();
                return done();
              });
            });
          });
        });

        it('caches server responses for the configured duration', asyncSpec(function(next) {
          up.proxy.config.cacheExpiry = 200; // 1 second for test

          const responses = [];
          const trackResponse = response => responses.push(response.text);

          next(() => {
            up.request({url: '/foo'}).then(trackResponse);
            return expect(jasmine.Ajax.requests.count()).toEqual(1);
          });

          next.after((10), () => {
            // Send the same request for the same path
            up.request({url: '/foo'}).then(trackResponse);

            // See that only a single network request was triggered
            expect(jasmine.Ajax.requests.count()).toEqual(1);
            return expect(responses).toEqual([]);
          });

          next(() => {
            // Server responds once.
            return this.respondWith('foo');
          });

          next(() => {
            // See that both requests have been fulfilled
            return expect(responses).toEqual(['foo', 'foo']);
          });

          next.after((200), () => {
            // Send another request after another 3 minutes
            // The clock is now a total of 6 minutes after the first request,
            // exceeding the cache's retention time of 5 minutes.
            up.request({url: '/foo'}).then(trackResponse);

            // See that we have triggered a second request
            return expect(jasmine.Ajax.requests.count()).toEqual(2);
          });

          next(() => {
            return this.respondWith('bar');
          });

          return next(() => {
            return expect(responses).toEqual(['foo', 'foo', 'bar']);
          });
        })
        );

        it("does not cache responses if config.cacheExpiry is 0", asyncSpec(function(next) {
          up.proxy.config.cacheExpiry = 0;
          next(() => up.request({url: '/foo'}));
          next(() => up.request({url: '/foo'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        it("does not cache responses if config.cacheSize is 0", asyncSpec(function(next) {
          up.proxy.config.cacheSize = 0;
          next(() => up.request({url: '/foo'}));
          next(() => up.request({url: '/foo'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        it('does not limit the number of cache entries if config.cacheSize is undefined');

        it('never discards old cache entries if config.cacheExpiry is undefined');

        it('respects a config.cacheSize setting', asyncSpec(function(next) {
          up.proxy.config.cacheSize = 2;
          next(() => up.request({url: '/foo'}));
          next(() => up.request({url: '/bar'}));
          next(() => up.request({url: '/baz'}));
          next(() => up.request({url: '/foo'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(4));
        })
        );

        it("doesn't reuse responses when asked for the same path, but different selectors", asyncSpec(function(next) {
          next(() => up.request({url: '/path', target: '.a'}));
          next(() => up.request({url: '/path', target: '.b'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        it("doesn't reuse responses when asked for the same path, but different params", asyncSpec(function(next) {
          next(() => up.request({url: '/path', params: { query: 'foo' }}));
          next(() => up.request({url: '/path', params: { query: 'bar' }}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        it("reuses a response for an 'html' selector when asked for the same path and any other selector", asyncSpec(function(next) {
          next(() => up.request({url: '/path', target: 'html'}));
          next(() => up.request({url: '/path', target: 'body'}));
          next(() => up.request({url: '/path', target: 'p'}));
          next(() => up.request({url: '/path', target: '.klass'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(1));
        })
        );

        it("reuses a response for a 'body' selector when asked for the same path and any other selector other than 'html'", asyncSpec(function(next) {
          next(() => up.request({url: '/path', target: 'body'}));
          next(() => up.request({url: '/path', target: 'p'}));
          next(() => up.request({url: '/path', target: '.klass'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(1));
        })
        );

        it("doesn't reuse a response for a 'body' selector when asked for the same path but an 'html' selector", asyncSpec(function(next) {
          next(() => up.request({url: '/path', target: 'body'}));
          next(() => up.request({url: '/path', target: 'html'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        it("doesn't reuse responses for different paths", asyncSpec(function(next) {
          next(() => up.request({url: '/foo'}));
          next(() => up.request({url: '/bar'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        u.each(['GET', 'HEAD', 'OPTIONS'], function(method) {

          it(`caches ${method} requests`, asyncSpec(function(next) {
            next(() => up.request({url: '/foo', method}));
            next(() => up.request({url: '/foo', method}));
            return next(() => expect(jasmine.Ajax.requests.count()).toEqual(1));
          })
          );

          return it(`does not cache ${method} requests with { cache: false }`, asyncSpec(function(next) {
            next(() => up.request({url: '/foo', method, cache: false}));
            next(() => up.request({url: '/foo', method, cache: false}));
            return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
          })
          );
        });

        u.each(['POST', 'PUT', 'DELETE'], method => it(`does not cache ${method} requests`, asyncSpec(function(next) {
          next(() => up.request({url: '/foo', method}));
          next(() => up.request({url: '/foo', method}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        ));

        it('does not cache responses with a non-200 status code', asyncSpec(function(next) {
          next(() => up.request({url: '/foo'}));
          next(() => this.respondWith({status: 500, contentType: 'text/html', responseText: 'foo'}));
          next(() => up.request({url: '/foo'}));
          return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
        })
        );

        describe('with config.wrapMethods set', function() {

          it('should be set by default', () => expect(up.proxy.config.wrapMethods).toBePresent());

          u.each(['GET', 'POST', 'HEAD', 'OPTIONS'], method => it(`does not change the method of a ${method} request`, asyncSpec(function(next) {
            up.request({url: '/foo', method});

            return next(() => {
              const request = this.lastRequest();
              expect(request.method).toEqual(method);
              return expect(request.data()['_method']).toBeUndefined();
            });
          })
          ));

          return u.each(['PUT', 'PATCH', 'DELETE'], method => it(`turns a ${method} request into a POST request and sends the actual method as a { _method } param to prevent unexpected redirect behavior (https://makandracards.com/makandra/38347)`, asyncSpec(function(next) {
            up.request({url: '/foo', method});

            return next(() => {
              const request = this.lastRequest();
              expect(request.method).toEqual('POST');
              return expect(request.data()['_method']).toEqual([method]);
            });
          })
          ));
        });
  //              expect(request.data()['foo']).toEqual('bar')

        describe('with config.maxRequests set', function() {

          beforeEach(function() {
            this.oldMaxRequests = up.proxy.config.maxRequests;
            return up.proxy.config.maxRequests = 1;
          });

          afterEach(function() {
            return up.proxy.config.maxRequests = this.oldMaxRequests;
          });

          it('limits the number of concurrent requests', asyncSpec(function(next) {
            const responses = [];
            const trackResponse = response => responses.push(response.text);

            next(() => {
              up.request({url: '/foo'}).then(trackResponse);
              return up.request({url: '/bar'}).then(trackResponse);
            });

            next(() => {
              return expect(jasmine.Ajax.requests.count()).toEqual(1);
            }); // only one request was made

            next(() => {
              return this.respondWith('first response', {request: jasmine.Ajax.requests.at(0)});
            });

            next(() => {
              expect(responses).toEqual(['first response']);
              return expect(jasmine.Ajax.requests.count()).toEqual(2);
            }); // a second request was made

            next(() => {
              return this.respondWith('second response', {request: jasmine.Ajax.requests.at(1)});
            });

            return next(() => {
              return expect(responses).toEqual(['first response', 'second response']);
          });}));

          return it('ignores preloading for the request limit', asyncSpec(function(next) {
            next(() => up.request({url: '/foo', preload: true}));
            next(() => up.request({url: '/bar'}));
            next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
            next(() => up.request({url: '/bar'}));
            return next(() => expect(jasmine.Ajax.requests.count()).toEqual(2));
          })
          );
        });

        describe('up:proxy:load event', function() {

          it('emits an up:proxy:load event before the request touches the network', asyncSpec(function(next) {
            const listener = jasmine.createSpy('listener');
            up.on('up:proxy:load', listener);
            up.request('/bar');

            return next(() => {
              expect(jasmine.Ajax.requests.count()).toEqual(1);

              const partialRequest = jasmine.objectContaining({
                method: 'GET',
                url: jasmine.stringMatching('/bar')
              });
              const partialEvent = jasmine.objectContaining({request: partialRequest});

              return expect(listener).toHaveBeenCalledWith(partialEvent, jasmine.anything(), jasmine.anything());
            });
          })
          );

          it('allows up:proxy:load listeners to prevent the request (useful to cancel all requests when stopping a test scenario)', function(done) {
            const listener = jasmine.createSpy('listener').and.callFake(function(event) {
              expect(jasmine.Ajax.requests.count()).toEqual(0);
              return event.preventDefault();
            });

            up.on('up:proxy:load', listener);

            const promise = up.request('/bar');

            return u.task(function() {
              expect(listener).toHaveBeenCalled();
              expect(jasmine.Ajax.requests.count()).toEqual(0);

              return promiseState(promise).then(function(result) {
                expect(result.state).toEqual('rejected');
                expect(result.value).toBeError(/prevented/i);
                return done();
              });
            });
          });

          it('does not block the queue when a request was prevented', function(done) {
            up.proxy.config.maxRequests = 1;

            const listener = jasmine.createSpy('listener').and.callFake(function(event) {
              // only prevent the first request
              if (event.request.url.indexOf('/path1') >= 0) {
                return event.preventDefault();
              }
            });

            up.on('up:proxy:load', listener);

            const promise1 = up.request('/path1');
            const promise2 = up.request('/path2');

            return u.task(() => {
              expect(listener.calls.count()).toBe(2);
              expect(jasmine.Ajax.requests.count()).toEqual(1);
              expect(this.lastRequest().url).toMatchUrl('/path2');
              return done();
            });
          });

          return it('allows up:proxy:load listeners to manipulate the request headers', function(done) {
            const listener = event => event.request.headers['X-From-Listener'] = 'foo';

            up.on('up:proxy:load', listener);

            up.request('/path1');

            return u.task(() => {
              expect(this.lastRequest().requestHeaders['X-From-Listener']).toEqual('foo');
              return done();
            });
          });
        });

        return describe('up:proxy:slow and up:proxy:recover events', function() {

          beforeEach(function() {
            up.proxy.config.slowDelay = 0;
            this.events = [];
            return u.each(['up:proxy:load', 'up:proxy:loaded', 'up:proxy:slow', 'up:proxy:recover', 'up:proxy:fatal'], eventName => {
              return up.on(eventName, () => {
                return this.events.push(eventName);
              });
            });
          });

          it('emits an up:proxy:slow event if the server takes too long to respond');

          it('does not emit an up:proxy:slow event if preloading', asyncSpec(function(next) {
            next(() => {
              // A request for preloading preloading purposes
              // doesn't make us busy.
              return up.request({url: '/foo', preload: true});
            });

            next(() => {
              expect(this.events).toEqual([
                'up:proxy:load'
              ]);
              return expect(up.proxy.isBusy()).toBe(false);
            });

            next(() => {
              // The same request with preloading does trigger up:proxy:slow.
              return up.request({url: '/foo'});
            });

            next(() => {
              expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow'
              ]);
              return expect(up.proxy.isBusy()).toBe(true);
            });

            next(() => {
              // The response resolves both promises and makes
              // the proxy idle again.
              return jasmine.Ajax.requests.at(0).respondWith({
                status: 200,
                contentType: 'text/html',
                responseText: 'foo'
              });
            });

            return next(() => {
              expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow',
                'up:proxy:loaded',
                'up:proxy:recover'
              ]);
              return expect(up.proxy.isBusy()).toBe(false);
            });
          })
          );

          it('can delay the up:proxy:slow event to prevent flickering of spinners', asyncSpec(function(next) {
            next(() => {
              up.proxy.config.slowDelay = 100;
              return up.request({url: '/foo'});
            });

            next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load'
              ]);
            });

            next.after(50, () => {
              return expect(this.events).toEqual([
                'up:proxy:load'
              ]);
            });

            next.after(60, () => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow'
              ]);
            });

            next(() => {
              return jasmine.Ajax.requests.at(0).respondWith({
                status: 200,
                contentType: 'text/html',
                responseText: 'foo'
              });
            });

            return next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow',
                'up:proxy:loaded',
                'up:proxy:recover'
              ]);
            });
          })
          );

          it('does not emit up:proxy:recover if a delayed up:proxy:slow was never emitted due to a fast response', asyncSpec(function(next) {
            next(() => {
              up.proxy.config.slowDelay = 200;
              return up.request({url: '/foo'});
            });

            next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load'
              ]);
            });

            next.after(100, () => {
              return jasmine.Ajax.requests.at(0).respondWith({
                status: 200,
                contentType: 'text/html',
                responseText: 'foo'
              });
            });

            return next.after(250, () => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:loaded'
              ]);
            });
          })
          );

          it('emits up:proxy:recover if a request returned but failed with an error code', asyncSpec(function(next) {
            next(() => {
              return up.request({url: '/foo'});
            });

            next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow'
              ]);
            });

            next(() => {
              return jasmine.Ajax.requests.at(0).respondWith({
                status: 500,
                contentType: 'text/html',
                responseText: 'something went wrong'
              });
            });

            return next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow',
                'up:proxy:loaded',
                'up:proxy:recover'
              ]);
            });
          })
          );


          return it('emits up:proxy:recover if a request returned but failed fatally', asyncSpec(function(next) {
            up.proxy.config.slowDelay = 10;

            next(() => {
              return up.request({url: '/foo', timeout: 75});
            });

            next.after(50, () => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow'
              ]);
            });

            next(() => {
              jasmine.clock().install(); // required by responseTimeout()
              return this.lastRequest().responseTimeout();
            });

            return next(() => {
              return expect(this.events).toEqual([
                'up:proxy:load',
                'up:proxy:slow',
                'up:proxy:fatal',
                'up:proxy:recover'
              ]);
            });
          })
          );
        });
      });


      describe('up.ajax', () => it('fulfills to the response text in order to match the $.ajax() API as good as possible', function(done) {
        const promise = up.ajax('/url');

        return u.timer(100, () => {
          this.respondWith('response-text');

          return promise.then(function(text) {
            expect(text).toEqual('response-text');

            return done();
          });
        });
      }));

      describe('up.proxy.preload', function() {

        describeCapability('canPushState', function() {

          beforeEach(function() {
            return this.requestTarget = () => this.lastRequest().requestHeaders['X-Up-Target'];});

          it("loads and caches the given link's destination", asyncSpec(function(next) {
            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"]');

            up.proxy.preload($link);

            return next(() => {
              const cachedPromise = up.proxy.get({url: '/path', target: '.target'});
              return expect(u.isPromise(cachedPromise)).toBe(true);
            });
          })
          );

          it("does not load a link whose method has side-effects", function(done) {
            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"][data-method="post"]');
            const preloadPromise = up.proxy.preload($link);

            return promiseState(preloadPromise).then(function(result) {
              expect(result.state).toEqual('rejected');
              expect(up.proxy.get({url: '/path', target: '.target'})).toBeUndefined();
              return done();
            });
          });

          it('accepts options', asyncSpec(function(next) {
            $fixture('.target');
            const $link = $fixture('a[href="/path"][up-target=".target"]');
            up.proxy.preload($link, {url: '/options-path'});

            return next(() => {
              const cachedPromise = up.proxy.get({url: '/options-path', target: '.target'});
              return expect(u.isPromise(cachedPromise)).toBe(true);
            });
          })
          );

          describe('for an [up-target] link', function() {

            it('includes the [up-target] selector as an X-Up-Target header if the targeted element is currently on the page', asyncSpec(function(next) {
              $fixture('.target');
              const $link = $fixture('a[href="/path"][up-target=".target"]');
              up.proxy.preload($link);
              return next(() => expect(this.requestTarget()).toEqual('.target'));
            })
            );

            it('replaces the [up-target] selector as with a fallback and uses that as an X-Up-Target header if the targeted element is not currently on the page', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-target=".target"]');
              up.proxy.preload($link);
              // The default fallback would usually be `body`, but in Jasmine specs we change
              // it to protect the test runner during failures.
              return next(() => expect(this.requestTarget()).toEqual('.default-fallback'));
            })
            );

            return it('calls up.request() with a { preload: true } option so it bypasses the concurrency limit', asyncSpec(function(next) {
              const requestSpy = spyOn(up, 'request');

              const $link = $fixture('a[href="/path"][up-target=".target"]');
              up.proxy.preload($link);

              return next(() => {
                return expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({preload: true}));
              });
            })
            );
          });

          describe('for an [up-modal] link', function() {

            beforeEach(() => up.motion.config.enabled = false);

            it('includes the [up-modal] selector as an X-Up-Target header and does not replace it with a fallback, since the modal frame always exists', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              up.proxy.preload($link);
              return next(() => expect(this.requestTarget()).toEqual('.target'));
            })
            );

            it('does not create a modal frame', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              up.proxy.preload($link);
              return next(() => {
                return expect('.up-modal').not.toBeAttached();
              });
            })
            );

            it('does not emit an up:modal:open event', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              const openListener = jasmine.createSpy('listener');
              up.on('up:modal:open', openListener);
              up.proxy.preload($link);
              return next(() => {
                return expect(openListener).not.toHaveBeenCalled();
              });
            })
            );

            it('does not close a currently open modal', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              const closeListener = jasmine.createSpy('listener');
              up.on('up:modal:close', closeListener);

              up.modal.extract('.content', '<div class="content">Modal content</div>');

              next(() => {
                return expect('.up-modal .content').toBeAttached();
              });

              next(() => {
                return up.proxy.preload($link);
              });

              next(() => {
                expect('.up-modal .content').toBeAttached();
                return expect(closeListener).not.toHaveBeenCalled();
              });

              next(() => {
                return up.modal.close();
              });

              return next(() => {
                expect('.up-modal .content').not.toBeAttached();
                return expect(closeListener).toHaveBeenCalled();
              });
            })
            );

            it('does not prevent the opening of other modals while the request is still pending', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              up.proxy.preload($link);

              next(() => {
                return up.modal.extract('.content', '<div class="content">Modal content</div>');
              });

              return next(() => {
                return expect('.up-modal .content').toBeAttached();
              });
            })
            );

            return it('calls up.request() with a { preload: true } option so it bypasses the concurrency limit', asyncSpec(function(next) {
              const requestSpy = spyOn(up, 'request');

              const $link = $fixture('a[href="/path"][up-modal=".target"]');
              up.proxy.preload($link);

              return next(() => {
                return expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({preload: true}));
              });
            })
            );
          });

          return describe('for an [up-popup] link', function() {

            beforeEach(() => up.motion.config.enabled = false);
            
            it('includes the [up-popup] selector as an X-Up-Target header and does not replace it with a fallback, since the popup frame always exists', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              up.proxy.preload($link);
              return next(() => expect(this.requestTarget()).toEqual('.target'));
            })
            );


            it('does not create a popup frame', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              up.proxy.preload($link);
              return next(() => {
                return expect('.up-popup').not.toBeAttached();
              });
            })
            );

            it('does not emit an up:popup:open event', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              const openListener = jasmine.createSpy('listener');
              up.on('up:popup:open', openListener);
              up.proxy.preload($link);
              return next(() => {
                return expect(openListener).not.toHaveBeenCalled();
              });
            })
            );

            it('does not close a currently open popup', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              const closeListener = jasmine.createSpy('listener');
              up.on('up:popup:close', closeListener);

              const $existingAnchor = $fixture('.existing-anchor');
              up.popup.attach($existingAnchor, {target: '.content', html: '<div class="content">popup content</div>'});

              next(() => {
                return expect('.up-popup .content').toBeAttached();
              });

              next(() => {
                return up.proxy.preload($link);
              });

              next(() => {
                expect('.up-popup .content').toBeAttached();
                return expect(closeListener).not.toHaveBeenCalled();
              });

              next(() => {
                return up.popup.close();
              });

              return next(() => {
                expect('.up-popup .content').not.toBeAttached();
                return expect(closeListener).toHaveBeenCalled();
              });
            })
            );

            it('does not prevent the opening of other popups while the request is still pending', asyncSpec(function(next) {
              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              up.proxy.preload($link);

              next(() => {
                const $anchor = $fixture('.existing-anchor');
                return up.popup.attach($anchor, {target: '.content', html: '<div class="content">popup content</div>'});
              });

              return next(() => {
                return expect('.up-popup .content').toBeAttached();
              });
            })
            );

            return it('calls up.request() with a { preload: true } option so it bypasses the concurrency limit', asyncSpec(function(next) {
              const requestSpy = spyOn(up, 'request');

              const $link = $fixture('a[href="/path"][up-popup=".target"]');
              up.proxy.preload($link);

              return next(() => {
                return expect(requestSpy).toHaveBeenCalledWith(jasmine.objectContaining({preload: true}));
              });
            })
            );
          });
        });

        return describeFallback('canPushState', () => it("does nothing", asyncSpec(function(next) {
          $fixture('.target');
          const $link = $fixture('a[href="/path"][up-target=".target"]');
          up.proxy.preload($link);
          return next(() => {
            return expect(jasmine.Ajax.requests.count()).toBe(0);
          });
        })
        ));
      });

      describe('up.proxy.get', function() {

        it('returns an existing cache entry for the given request', function() {
          const promise1 = up.request({url: '/foo', params: { key: 'value' }});
          const promise2 = up.proxy.get({url: '/foo', params: { key: 'value' }});
          return expect(promise1).toBe(promise2);
        });

        it('returns undefined if the given request is not cached', function() {
          const promise = up.proxy.get({url: '/foo', params: { key: 'value' }});
          return expect(promise).toBeUndefined();
        });

        return describeCapability('canInspectFormData', () => it("returns undefined if the given request's { params } is a FormData object", function() {
          const promise = up.proxy.get({url: '/foo', params: new FormData()});
          return expect(promise).toBeUndefined();
        }));
      });

      describe('up.proxy.set', () => it('should have tests'));

      describe('up.proxy.alias', () => it('uses an existing cache entry for another request (used in case of redirects)'));

      describe('up.proxy.remove', function() {

        it('removes the cache entry for the given request');

        it('does nothing if the given request is not cached');

        return describeCapability('canInspectFormData', () => it('does not crash when passed a request with FormData (bugfix)', function() {
          const removal = () => up.proxy.remove({url: '/path', params: new FormData()});
          return expect(removal).not.toThrowError();
        }));
      });

      return describe('up.proxy.clear', () => it('removes all cache entries'));
    });

    return describe('unobtrusive behavior', () => describe('[up-preload]', function() {

      it('preloads the link destination when hovering, after a delay', asyncSpec(function(next) {
        up.proxy.config.preloadDelay = 100;

        $fixture('.target').text('old text');

        const $link = $fixture('a[href="/foo"][up-target=".target"][up-preload]');
        up.hello($link);

        Trigger.hoverSequence($link);

        next.after(50, () => {
          // It's still too early
          return expect(jasmine.Ajax.requests.count()).toEqual(0);
        });

        next.after(75, () => {
          expect(jasmine.Ajax.requests.count()).toEqual(1);
          expect(this.lastRequest().url).toMatchUrl('/foo');
          expect(this.lastRequest()).toHaveRequestMethod('GET');
          expect(this.lastRequest().requestHeaders['X-Up-Target']).toEqual('.target');

          return this.respondWith(`\
  <div class="target">
  new text
  </div>\
  `
          );
        });

        next(() => {
          // We only preloaded, so the target isn't replaced yet.
          expect('.target').toHaveText('old text');

          return Trigger.clickSequence($link);
        });

        return next(() => {
          // No additional request has been sent since we already preloaded
          expect(jasmine.Ajax.requests.count()).toEqual(1);

          // The target is replaced instantly
          return expect('.target').toHaveText('new text');
        });
      })
      );

      it('does not send a request if the user stops hovering before the delay is over', asyncSpec(function(next) {
        up.proxy.config.preloadDelay = 100;

        $fixture('.target').text('old text');

        const $link = $fixture('a[href="/foo"][up-target=".target"][up-preload]');
        up.hello($link);

        Trigger.hoverSequence($link);

        next.after(40, () => {
          // It's still too early
          expect(jasmine.Ajax.requests.count()).toEqual(0);

          return Trigger.unhoverSequence($link);
        });

        return next.after(90, () => {
          return expect(jasmine.Ajax.requests.count()).toEqual(0);
        });
      })
      );

      it('does not cache a failed response', asyncSpec(function(next) {
        up.proxy.config.preloadDelay = 0;

        $fixture('.target').text('old text');

        const $link = $fixture('a[href="/foo"][up-target=".target"][up-preload]');
        up.hello($link);

        Trigger.hoverSequence($link);

        next.after(50, () => {
          expect(jasmine.Ajax.requests.count()).toEqual(1);

          return this.respondWith({
            status: 500,
            responseText: `\
  <div class="target">
  new text
  </div>\
  `
          });
        });

        next(() => {
          // We only preloaded, so the target isn't replaced yet.
          expect('.target').toHaveText('old text');

          return Trigger.click($link);
        });

        return next(() => {
          // Since the preloading failed, we send another request
          expect(jasmine.Ajax.requests.count()).toEqual(2);

          // Since there isn't anyone who could handle the rejection inside
          // the event handler, our handler mutes the rejection.
          if (REJECTION_EVENTS_SUPPORTED) { return expect(window).not.toHaveUnhandledRejections(); }
        });
      })
      );

      return it('triggers a separate AJAX request when hovered multiple times and the cache expires between hovers', asyncSpec(function(next)  {
        up.proxy.config.cacheExpiry = 100;
        up.proxy.config.preloadDelay = 0;

        const $element = $fixture('a[href="/foo"][up-preload]');
        up.hello($element);

        Trigger.hoverSequence($element);

        next.after(10, () => {
          return expect(jasmine.Ajax.requests.count()).toEqual(1);
        });

        next.after(10, () => {
          return Trigger.hoverSequence($element);
        });

        next.after(10, () => {
          return expect(jasmine.Ajax.requests.count()).toEqual(1);
        });

        next.after(150, () => {
          return Trigger.hoverSequence($element);
        });

        return next.after(30, () => {
          return expect(jasmine.Ajax.requests.count()).toEqual(2);
        });
      })
      );
    }));
  });
})();