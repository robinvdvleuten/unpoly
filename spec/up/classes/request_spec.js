/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.Request', function() {

    describe('#url', function() {

      it('returns the given URL', function() {
        const request = new up.Request({url: 'http://host.com/foo'});
        return expect(request.url).toEqual('http://host.com/foo');
      });

      it('does not include a hash anchor of the constructed URL', function() {
        const request = new up.Request({url: 'http://host.com/foo#hash'});
        return expect(request.url).toEqual('http://host.com/foo');
      });

      it("merges { params } for HTTP methods that don't allow a payload", function() {
        const request = new up.Request({url: 'http://host.com/foo?urlKey=urlValue', params: { paramsKey: 'paramsValue' }, method: 'get'});
        return expect(request.url).toEqual('http://host.com/foo?urlKey=urlValue&paramsKey=paramsValue');
      });

      return it('keeps query params in the URL for HTTP methods that allow a payload', function() {
        const request = new up.Request({url: 'http://host.com/foo?key=value', method: 'post'});
        expect(request.url).toEqual('http://host.com/foo?key=value');
        return expect(request.params).toBeBlank();
      });
    });

    describe('#method', () => it('defaults to "GET"', function() {
      const request = new up.Request({url: 'http://host.com/foo'});
      return expect(request.method).toEqual('GET');
    }));

    describe('#hash', function() {

      it('returns the hash anchor from the constructed URL', function() {
        const request = new up.Request({url: 'http://host.com/foo#hash'});
        return expect(request.hash).toEqual('#hash');
      });

      return it('returns undefined if the constructed URL had no hash anchor', function() {
        const request = new up.Request({url: 'http://host.com/foo'});
        return expect(request.hash).toBeUndefined();
      });
    });

    return describe('#params', function() {

      it('returns the constructed params for HTTP methods that allow a payload', function() {
        const params = { key: 'value' };
        const request = new up.Request({url: 'http://host.com/foo', params, method: 'post'});
        return expect(request.params).toEqual(new up.Params(params));
      });

      return it("returns a blank up.Params object for HTTP methods that don't allow a payload", function() {
        const request = new up.Request({url: 'http://host.com/foo', params: { key: 'value' }, method: 'get'});
        return expect(request.params).toBeBlank();
      });
    });
  });
})();
