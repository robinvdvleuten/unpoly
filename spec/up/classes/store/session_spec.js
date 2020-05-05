/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.store.Session', function() {

    afterEach(() => sessionStorage.removeItem('spec'));

    describe('#get', function() {

      it('returns an item that was previously set', function() {
        const store = new up.store.Session('spec');
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');

        expect(store.get('foo')).toEqual('value of foo');
        return expect(store.get('bar')).toEqual('value of bar');
      });

      it('returns undefined if no item with that key was set', function() {
        const store = new up.store.Session('spec');
        store.set('foo', 'value of foo');

        return expect(store.get('bar')).toBeUndefined();
      });

      return it('does not read keys from a store with anotther root key', function() {
        let store = new up.store.Session('spec.v1');
        store.set('foo', 'value of foo');
        expect(store.get('foo')).toEqual('value of foo');

        store = new up.store.Session('spec.v2');
        return expect(store.get('foo')).toBeUndefined();
      });
    });

    describe('#set', function() {

      it('stores the given item in window.sessionStorage where it survives a follow without Unpoly', function() {
        const store = new up.store.Session('spec');
        store.set('foo', 'value of foo');

        return expect(window.sessionStorage.getItem('spec')).toContain('foo');
      });

      it('stores boolean values across sessions', function() {
        const store1 = new up.store.Session('spec');
        store1.set('foo', true);
        store1.set('bar', false);

        const store2 = new up.store.Session('spec');
        expect(store2.get('foo')).toEqual(true);
        return expect(store2.get('bar')).toEqual(false);
      });

      it('stores number values across sessions', function() {
        const store1 = new up.store.Session('spec');
        store1.set('foo', 123);

        const store2 = new up.store.Session('spec');
        return expect(store2.get('foo')).toEqual(123);
      });

      return it('stores structured values across sessions', function() {
        const store1 = new up.store.Session('spec');
        store1.set('foo', { bar: ['baz', 'bam'] });

        const store2 = new up.store.Session('spec');
        const storedValue = store2.get('foo');
        expect(u.isObject(storedValue)).toBe(true);
        return expect(storedValue).toEqual({ bar: ['baz', 'bam'] });
    });
  });

    describe('#keys', function() {

      it('returns an array of keys in the store', function() {
        const store = new up.store.Session('spec');
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');

        return expect(store.keys().sort()).toEqual(['bar', 'foo']);
    });

      return it('does not return keys for entries that were removed (bugfix)', function() {
        const store = new up.store.Session('spec');
        store.set('foo', 'value of foo');
        store.set('bar', 'value of bar');
        store.remove('bar');

        return expect(store.keys().sort()).toEqual(['foo']);
    });
  });

    describe('#values', () => it('returns an array of values in the store', function() {
      const store = new up.store.Session('spec');
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      return expect(store.values().sort()).toEqual(['value of bar', 'value of foo']);
  }));

    describe('#clear', () => it('removes all keys from the store', function() {
      const store = new up.store.Session('spec');
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.clear();

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toBeUndefined();
    }));

    return describe('#remove', () => it('removes the given key from the store', function() {
      const store = new up.store.Session('spec');
      store.set('foo', 'value of foo');
      store.set('bar', 'value of bar');

      store.remove('foo');

      expect(store.get('foo')).toBeUndefined();
      return expect(store.get('bar')).toEqual('value of bar');
    }));
  });
})();