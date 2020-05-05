/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.store.Memory', function() {

    describe('#get', function() {

      it('returns an item that was previously set', function() {
        const store = new up.store.Memory();
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');

        expect(store.get('foo')).toEqual('value of foo');
        return expect(store.get('bar')).toEqual('value of bar');
      });

      return it('returns undefined if no item with that key was set', function() {
        const store = new up.store.Memory();
        store.set('foo', 'value of foo');

        return expect(store.get('bar')).toBeUndefined();
      });
    });

    describe('#keys', function() {

      it('returns an array of keys in the store', function() {
        const store = new up.store.Memory();
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');

        return expect(store.keys().sort()).toEqual(['bar', 'foo']);
    });

      return it('does not return keys for entries that were removed (bugfix)', function() {
        const store = new up.store.Memory();
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');
        store.remove('bar');

        return expect(store.keys().sort()).toEqual(['foo']);
    });
  });

    describe('#values', () => it('returns an array of values in the store', function() {
      const store = new up.store.Memory();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      return expect(store.values().sort()).toEqual(['value of bar', 'value of foo']);
  }));

    describe('#clear', () => it('removes all keys from the store', function() {
      const store = new up.store.Memory();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.clear();

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toBeUndefined();
    }));

    return describe('#remove', () => it('removes the given key from the store', function() {
      const store = new up.store.Memory();
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.remove('foo');

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toEqual('value of bar');
    }));
  });
})();
