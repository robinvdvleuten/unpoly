/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.Cache', function() {

    describe('#get', function() {

      it('returns an item that was previously set', function() {
        const store = new up.Cache();
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');

        expect(store.get('foo')).toEqual('value of foo');
        return expect(store.get('bar')).toEqual('value of bar');
      });

      it('returns undefined if no item with that key was set', function() {
        const store = new up.Cache();
        store.set('foo', 'value of foo');

        return expect(store.get('bar')).toBeUndefined();
      });

      return it('returns undefined if the item has expired', function() {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date());

        const store = new up.Cache({expiry: 100, logPrefix: 'cache'});
        store.set('foo', 'value of foo');

        jasmine.clock().tick(80);
        expect(store.get('foo')).toEqual('value of foo');

        jasmine.clock().tick(40);
        return expect(store.get('foo')).toBeUndefined();
      });
    });

    describe('#set', () => it('removes the oldest item if setting a new item would exceed the cache size', function() {
      jasmine.clock().install();
      const store = new up.Cache({size: 2, logPrefix: 'cache'});

      store.set('foo', 'value of foo');
      jasmine.clock().tick(10);
      store.set('bar', 'value of bar');
      jasmine.clock().tick(10);
      store.set('baz', 'value of baz');

      expect(store.get('foo')).toBeUndefined();
      expect(store.get('bar')).toEqual('value of bar');
      return expect(store.get('baz')).toEqual('value of baz');
    }));

    describe('#keys', () => it('returns an array of keys in the store', function() {
      const store = new up.Cache();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      return expect(store.keys().sort()).toEqual(['bar', 'foo']);
  }));

    describe('#clear', () => it('removes all keys from the store', function() {
      const store = new up.Cache();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.clear();

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toBeUndefined();
    }));

    return describe('#remove', () => it('removes the given key from the store', function() {
      const store = new up.Cache();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.remove('foo');

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toEqual('value of bar');
    }));
  });
})();