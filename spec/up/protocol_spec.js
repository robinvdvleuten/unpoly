/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.protocol', function() {

    describe('up.protocol.csrfToken', function() {

      afterEach(function() {
        return (this.$meta != null ? this.$meta.remove() : undefined);
      });

      it('returns the [content] of a <meta name="csrf-token"> by default', function() {
        this.$meta = $('<meta name="csrf-token" content="token-from-meta">').appendTo('head');
        return expect(up.protocol.csrfToken()).toEqual('token-from-meta');
      });

      it('returns a configured token', function() {
        up.protocol.config.csrfToken = 'configured-token';
        return expect(up.protocol.csrfToken()).toEqual('configured-token');
      });

      return it('allows to configure a function that returns the token', function() {
        up.protocol.config.csrfToken = () => 'configured-token';
        return expect(up.protocol.csrfToken()).toEqual('configured-token');
      });
    });

    return describe('up.protocol.csrfParam()', function() {

      afterEach(function() {
        return (this.$meta != null ? this.$meta.remove() : undefined);
      });
        
      it('returns the [content] of a <meta name="csrf-param"> by default', function() {
        this.$meta = $('<meta name="csrf-param" content="param-from-meta">').appendTo('head');
        return expect(up.protocol.csrfParam()).toEqual('param-from-meta');
      });

      it('returns a configured parameter name', function() {
        up.protocol.config.csrfParam = 'configured-param';
        return expect(up.protocol.csrfParam()).toEqual('configured-param');
      });

      return it('allows to configure a function that returns the parameter name', function() {
        up.protocol.config.csrfParam = () => 'configured-param';
        return expect(up.protocol.csrfParam()).toEqual('configured-param');
      });
    });
  });
})();