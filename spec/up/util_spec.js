/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.util', () => describe('JavaScript functions', function() {

    describe('up.util.isEqual', function() {

      describe('for an Element', function() {

        it('returns true for the same Element reference', function() {
          const div = document.createElement('div');
          return expect(up.util.isEqual(div, div)).toBe(true);
        });

        it('returns false for a different Element reference', function() {
          const div1 = document.createElement('div');
          const div2 = document.createElement('div');
          return expect(up.util.isEqual(div1, div2)).toBe(false);
        });

        return it('returns false for a value this is no Element', function() {
          const div = document.createElement('div');
          return expect(up.util.isEqual(div, 'other')).toBe(false);
        });
      });

      describe('for an Array', function() {

        it('returns true for a different Array reference with the same elements', function() {
          const array1 = ['foo', 'bar'];
          const array2 = ['foo', 'bar'];
          return expect(up.util.isEqual(array1, array2)).toBe(true);
        });

        it('returns false for an Array with different elements', function() {
          const array1 = ['foo', 'bar'];
          const array2 = ['foo', 'qux'];
          return expect(up.util.isEqual(array1, array2)).toBe(false);
        });

        it('returns false for an Array that is a suffix', function() {
          const array1 = ['foo', 'bar'];
          const array2 = [       'bar'];
          return expect(up.util.isEqual(array1, array2)).toBe(false);
        });

        it('returns false for an Array that is a prefix', function() {
          const array1 = ['foo', 'bar'];
          const array2 = ['foo'       ];
          return expect(up.util.isEqual(array1, array2)).toBe(false);
        });

        it('returns true for a NodeList with the same elements', function() {
          const parent = e.affix(document.body, '.parent');
          const child1 = e.affix(parent, '.child.one');
          const child2 = e.affix(parent, '.child.two');

          const array = [child1, child2];
          const nodeList = parent.querySelectorAll('.child');

          return expect(up.util.isEqual(array, nodeList)).toBe(true);
        });

        it('returns true for a HTMLCollection with the same elements', function() {
          const parent = e.affix(document.body, '.parent');
          const child1 = e.affix(parent, '.child.one');
          const child2 = e.affix(parent, '.child.two');

          const array = [child1, child2];
          const htmlCollection = parent.children;

          return expect(up.util.isEqual(array, htmlCollection)).toBe(true);
        });

        it('returns true for an arguments object with the same elements', function() {
          const toArguments = function() { return arguments; };
          const array = ['foo', 'bar'];
          const args = toArguments('foo', 'bar');

          return expect(up.util.isEqual(array, args)).toBe(true);
        });

        return it('returns false for a value that is no Array', function() {
          const array = ['foo', 'bar'];
          return expect(up.util.isEqual(array, 'foobar')).toBe(false);
        });
      });

      describe('for a string', function() {

        it('returns true for a different string reference with the same characters', function() {
          const string1 = 'bar';
          const string2 = 'bar';
          return expect(up.util.isEqual(string1, string2)).toBe(true);
        });

        it('returns false for a string with different characters', function() {
          const string1 = 'foo';
          const string2 = 'bar';
          return expect(up.util.isEqual(string1, string2)).toBe(false);
        });

        it('returns true for a String() object with the same characters', function() {
          const stringLiteral = 'bar';
          const stringObject = new String('bar');
          return expect(up.util.isEqual(stringLiteral, stringObject)).toBe(true);
        });

        it('returns false for a String() object with different characters', function() {
          const stringLiteral = 'foo';
          const stringObject = new String('bar');
          return expect(up.util.isEqual(stringLiteral, stringObject)).toBe(false);
        });

        return it('returns false for a value that is no string', () => expect(up.util.isEqual('foo', ['foo'])).toBe(false));
      });

      describe('for a number', function() {

        it('returns true for a different number reference with the same integer value', function() {
          const number1 = 123;
          const number2 = 123;
          return expect(up.util.isEqual(number1, number2)).toBe(true);
        });

        it('returns true for a different number reference with the same floating point value', function() {
          const number1 = 123.4;
          const number2 = 123.4;
          return expect(up.util.isEqual(number1, number2)).toBe(true);
        });

        it('returns false for a number with a different value', function() {
          const number1 = 123;
          const number2 = 124;
          return expect(up.util.isEqual(number1, number2)).toBe(false);
        });

        it('returns true for a Number() object with the same value', function() {
          const numberLiteral = 123;
          const numberObject = new Number(123);
          return expect(up.util.isEqual(numberLiteral, numberObject)).toBe(true);
        });

        it('returns false for a Number() object with a different value', function() {
          const numberLiteral = 123;
          const numberObject = new Object(124);
          return expect(up.util.isEqual(numberLiteral, numberObject)).toBe(false);
        });

        return it('returns false for a value that is no number', () => expect(up.util.isEqual(123, '123')).toBe(false));
      });

      describe('for undefined', function() {

        it('returns true for undefined', () => expect(up.util.isEqual(undefined, undefined)).toBe(true));

        it('returns false for null', () => expect(up.util.isEqual(undefined, null)).toBe(false));

        it('returns false for NaN', () => expect(up.util.isEqual(undefined, NaN)).toBe(false));

        it('returns false for an empty Object', () => expect(up.util.isEqual(undefined, {})).toBe(false));

        return it('returns false for an empty string', () => expect(up.util.isEqual(undefined, '')).toBe(false));
      });

      describe('for null', function() {

        it('returns true for null', () => expect(up.util.isEqual(null, null)).toBe(true));

        it('returns false for undefined', () => expect(up.util.isEqual(null, undefined)).toBe(false));

        it('returns false for NaN', () => expect(up.util.isEqual(null, NaN)).toBe(false));

        it('returns false for an empty Object', () => expect(up.util.isEqual(null, {})).toBe(false));

        return it('returns false for an empty string', () => expect(up.util.isEqual(null, '')).toBe(false));
      });

      describe('for NaN', function() {

        it("returns false for NaN because it represents multiple values", () => expect(up.util.isEqual(NaN, NaN)).toBe(false));

        it('returns false for null', () => expect(up.util.isEqual(NaN, null)).toBe(false));

        it('returns false for undefined', () => expect(up.util.isEqual(NaN, undefined)).toBe(false));

        it('returns false for an empty Object', () => expect(up.util.isEqual(NaN, {})).toBe(false));

        return it('returns false for an empty string', () => expect(up.util.isEqual(NaN, '')).toBe(false));
      });

      describe('for a Date', function() {

        it('returns true for another Date object that points to the same millisecond', function() {
          const d1 = new Date('1995-12-17T03:24:00');
          const d2 = new Date('1995-12-17T03:24:00');
          return expect(up.util.isEqual(d1, d2)).toBe(true);
        });

        it('returns false for another Date object that points to another millisecond', function() {
          const d1 = new Date('1995-12-17T03:24:00');
          const d2 = new Date('1995-12-17T03:24:01');
          return expect(up.util.isEqual(d1, d2)).toBe(false);
        });

        it('returns true for another Date object that points to the same millisecond in another time zone', function() {
          const d1 = new Date('2019-01-20T17:35:00+01:00');
          const d2 = new Date('2019-01-20T16:35:00+00:00');
          return expect(up.util.isEqual(d1, d2)).toBe(true);
        });

        return it('returns false for a value that is not a Date', function() {
          const d1 = new Date('1995-12-17T03:24:00');
          const d2 = '1995-12-17T03:24:00';
          return expect(up.util.isEqual(d1, d2)).toBe(false);
        });
      });

      describe('for a plain Object', function() {

        it('returns true for the same reference', function() {
          const obj = {};
          const reference = obj;
          return expect(up.util.isEqual(obj, reference)).toBe(true);
        });

        it('returns true for another plain object with the same keys and values', function() {
          const obj1 = { foo: 'bar', baz: 'bam' };
          const obj2 = { foo: 'bar', baz: 'bam' };
          return expect(up.util.isEqual(obj1, obj2)).toBe(true);
        });

        it('returns false for another plain object with the same keys, but different values', function() {
          const obj1 = { foo: 'bar', baz: 'bam' };
          const obj2 = { foo: 'bar', baz: 'qux' };
          return expect(up.util.isEqual(obj1, obj2)).toBe(false);
        });

        it('returns false for another plain object that is missing a key', function() {
          const obj1 = { foo: 'bar', baz: 'bam' };
          const obj2 = { foo: 'bar'             };
          return expect(up.util.isEqual(obj1, obj2)).toBe(false);
        });

        it('returns false for another plain object that has an additional key', function() {
          const obj1 = { foo: 'bar'             };
          const obj2 = { foo: 'bar', baz: 'bam' };
          return expect(up.util.isEqual(obj1, obj2)).toBe(false);
        });

        it('returns false for a non-plain Object, even if it has the same keys and values', function() {
          class Account {
            constructor(email) {
              this.email = email;
            }
          }

          const accountInstance = new Account('foo@example.com');
          const accountPlain = {};
          for (let key in accountInstance) {
            const value = accountInstance[key];
            accountPlain[key] = value;
          }
          return expect(up.util.isEqual(accountPlain, accountInstance)).toBe(false);
        });

        return it('returns false for a value that is no object', function() {
          const obj = { foo: 'bar' };
          return expect(up.util.isEqual(obj, 'foobar')).toBe(false);
        });
      });

      return describe('for a non-Plain object', function() {

        it('returns true for the same reference', function() {
          const obj = new FormData();
          const reference = obj;
          return expect(up.util.isEqual(obj, reference)).toBe(true);
        });

        it('returns false for different references', function() {
          const obj1 = new FormData();
          const obj2 = new FormData();
          return expect(up.util.isEqual(obj1, obj2)).toBe(false);
        });

        it('returns false for a different object with the same keys and values', function() {
          class Account {
            constructor(email) {
              this.email = email;
            }
          }

          const account1 = new Account('foo@example.com');
          const account2 = new Account('bar@example.com');

          return expect(up.util.isEqual(account1, account2)).toBe(false);
        });

        it('allows the object to hook into the comparison protocol by implementing a method called `up.util.isEqual.key`', function() {
          class Account {
            constructor(email) {
              this.email = email;
            }
            [up.util.isEqual.key](other) {
              return this.email === other.email;
            }
          }

          const account1 = new Account('foo@example.com');
          const account2 = new Account('bar@example.com');
          const account3 = new Account('foo@example.com');

          expect(up.util.isEqual(account1, account2)).toBe(false);
          return expect(up.util.isEqual(account1, account3)).toBe(true);
        });

        return it('returns false for a value that is no object', function() {
          class Account {
            constructor(email) {
              this.email = email;
            }
          }

          const account = new Account('foo@example.com');

          return expect(up.util.isEqual(account, 'foo@example.com')).toBe(false);
        });
      });
    });

    describe('up.util.flatMap', function() {

      it('collects the Array results of the given map function, then concatenates the result arrays into one flat array', function() {
        const fun = x => [x, x];
        const result = up.util.flatMap([1, 2, 3], fun);
        return expect(result).toEqual([1, 1, 2, 2, 3, 3]);
      });

      it('builds an array from mixed function return values of scalar values and lists', function() {
        const fun = function(x) {
          if (x === 1) {
            return 1;
          } else {
            return [x, x];
          }
        };

        const result = up.util.flatMap([0, 1, 2], fun);
        return expect(result).toEqual([0, 0, 1, 2, 2]);
    });


      return it('flattens return values that are NodeLists', function() {
        const fun = selector => document.querySelectorAll(selector);

        const foo1 = $fixture('.foo-element')[0];
        const foo2 = $fixture('.foo-element')[0];
        const bar = $fixture('.bar-element')[0];

        const result = up.util.flatMap(['.foo-element', '.bar-element'], fun);

        return expect(result).toEqual([foo1, foo2, bar]);
    });
  });


    describe('up.util.uniq', function() {

      it('returns the given array with duplicates elements removed', function() {
        const input = [1, 2, 1, 1, 3];
        const result = up.util.uniq(input);
        return expect(result).toEqual([1, 2, 3]);
    });

      it('works on DOM elements', function() {
        const one = document.createElement("div");
        const two = document.createElement("div");
        const input = [one, one, two, two];
        const result = up.util.uniq(input);
        return expect(result).toEqual([one, two]);
    });

      return it('preserves insertion order', function() {
        const input = [1, 2, 1];
        const result = up.util.uniq(input);
        return expect(result).toEqual([1, 2]);
    });
  });

    describe('up.util.uniqBy', function() {

      it('returns the given array with duplicate elements removed, calling the given function to determine value for uniqueness', function() {
        const input = ["foo", "bar", "apple", 'orange', 'banana'];
        const result = up.util.uniqBy(input, element => element.length);
        return expect(result).toEqual(['foo', 'apple', 'orange']);
    });

      return it('accepts a property name instead of a function, which collects that property from each item to compute uniquness', function() {
        const input = ["foo", "bar", "apple", 'orange', 'banana'];
        const result = up.util.uniqBy(input, 'length');
        return expect(result).toEqual(['foo', 'apple', 'orange']);
    });
  });

  //    describe 'up.util.parsePath', ->
  //
  //      it 'parses a plain name', ->
  //        path = up.util.parsePath("foo")
  //        expect(path).toEqual ['foo']
  //
  //      it 'considers underscores to be part of a name', ->
  //        path = up.util.parsePath("foo_bar")
  //        expect(path).toEqual ['foo_bar']
  //
  //      it 'considers dashes to be part of a name', ->
  //        path = up.util.parsePath("foo-bar")
  //        expect(path).toEqual ['foo-bar']
  //
  //      it 'parses dot-separated names into multiple path segments', ->
  //        path = up.util.parsePath('foo.bar.baz')
  //        expect(path).toEqual ['foo', 'bar', 'baz']
  //
  //      it 'parses nested params notation with square brackets', ->
  //        path = up.util.parsePath('user[account][email]')
  //        expect(path).toEqual ['user', 'account', 'email']
  //
  //      it 'parses double quotes in square brackets', ->
  //        path = up.util.parsePath('user["account"]["email"]')
  //        expect(path).toEqual ['user', 'account', 'email']
  //
  //      it 'parses single quotes in square brackets', ->
  //        path = up.util.parsePath("user['account']['email']")
  //        expect(path).toEqual ['user', 'account', 'email']
  //
  //      it 'allows square brackets inside quotes', ->
  //        path = up.util.parsePath("element['a[up-href]']")
  //        expect(path).toEqual ['element', 'a[up-href]']
  //
  //      it 'allows single quotes inside double quotes', ->
  //        path = up.util.parsePath("element[\"a[up-href='foo']\"]")
  //        expect(path).toEqual ['element', "a[up-href='foo']"]
  //
  //      it 'allows double quotes inside single quotes', ->
  //        path = up.util.parsePath("element['a[up-href=\"foo\"]']")
  //        expect(path).toEqual ['element', 'a[up-href="foo"]']
  //
  //      it 'allows dots in square brackets when it is quoted', ->
  //        path = up.util.parsePath('elements[".foo"]')
  //        expect(path).toEqual ['elements', '.foo']
  //
  //      it 'allows different notation for each segment', ->
  //        path = up.util.parsePath('foo.bar[baz]["bam"][\'qux\']')
  //        expect(path).toEqual ['foo', 'bar', 'baz', 'bam', 'qux']

    describe('up.util.parseUrl', function() {

      it('parses a full URL', function() {
        const url = up.util.parseUrl('https://subdomain.domain.tld:123/path?search#hash');
        expect(url.protocol).toEqual('https:');
        expect(url.hostname).toEqual('subdomain.domain.tld');
        expect(url.port).toEqual('123');
        expect(url.pathname).toEqual('/path');
        expect(url.search).toEqual('?search');
        return expect(url.hash).toEqual('#hash');
      });

      it('parses an absolute path', function() {
        const url = up.util.parseUrl('/qux/foo?search#bar');
        expect(url.protocol).toEqual(location.protocol);
        expect(url.hostname).toEqual(location.hostname);
        expect(url.port).toEqual(location.port);
        expect(url.pathname).toEqual('/qux/foo');
        expect(url.search).toEqual('?search');
        return expect(url.hash).toEqual('#bar');
      });

      it('parses a relative path', function() {
        up.history.config.enabled = true;
        up.history.replace('/qux/');
        const url = up.util.parseUrl('foo?search#bar');
        expect(url.protocol).toEqual(location.protocol);
        expect(url.hostname).toEqual(location.hostname);
        expect(url.port).toEqual(location.port);
        expect(url.pathname).toEqual('/qux/foo');
        expect(url.search).toEqual('?search');
        return expect(url.hash).toEqual('#bar');
      });

      it('allows to pass a link element', function() {
        const link = document.createElement('a');
        link.href = '/qux/foo?search#bar';
        const url = up.util.parseUrl(link);
        expect(url.protocol).toEqual(location.protocol);
        expect(url.hostname).toEqual(location.hostname);
        expect(url.port).toEqual(location.port);
        expect(url.pathname).toEqual('/qux/foo');
        expect(url.search).toEqual('?search');
        return expect(url.hash).toEqual('#bar');
      });

      return it('allows to pass a link element as a jQuery collection', function() {
        const $link = $('<a></a>').attr({href: '/qux/foo?search#bar'});
        const url = up.util.parseUrl($link);
        expect(url.protocol).toEqual(location.protocol);
        expect(url.hostname).toEqual(location.hostname);
        expect(url.port).toEqual(location.port);
        expect(url.pathname).toEqual('/qux/foo');
        expect(url.search).toEqual('?search');
        return expect(url.hash).toEqual('#bar');
      });
    });

    describe('up.util.map', function() {

      it('creates a new array of values by calling the given function on each item of the given array', function() {
        const array = ["apple", "orange", "cucumber"];
        const mapped = up.util.map(array, element => element.length);
        return expect(mapped).toEqual([5, 6, 8]);
    });

      it('accepts a property name instead of a function, which collects that property from each item', function() {
        const array = ["apple", "orange", "cucumber"];
        const mapped = up.util.map(array, 'length');
        return expect(mapped).toEqual([5, 6, 8]);
    });

      return it('passes the iteration index as second argument to the given function', function() {
        const array = ["apple", "orange", "cucumber"];
        const mapped = up.util.map(array, (element, i) => i);
        return expect(mapped).toEqual([0, 1, 2]);
    });
  });

    describe('up.util.mapObject', () => it('creates an object from the given array and pairer', function() {
      const array = ['foo', 'bar', 'baz'];
      const object = up.util.mapObject(array, str => [`${str}Key`, `${str}Value`]);
      return expect(object).toEqual({
        fooKey: 'fooValue',
        barKey: 'barValue',
        bazKey: 'bazValue'
      });
    }));

    describe('up.util.each', function() {

      it('calls the given function once for each item of the given array', function() {
        const args = [];
        const array = ["apple", "orange", "cucumber"];
        up.util.each(array, item => args.push(item));
        return expect(args).toEqual(["apple", "orange", "cucumber"]);
    });

      it('passes the iteration index as second argument to the given function', function() {
        const args = [];
        const array = ["apple", "orange", "cucumber"];
        up.util.each(array, (item, index) => args.push(index));
        return expect(args).toEqual([0, 1, 2]);
    });

      return it('iterates over an array-like value', function() {
        const one = fixture('.qwertz');
        const two = fixture('.qwertz');
        const nodeList = document.querySelectorAll('.qwertz');

        const callback = jasmine.createSpy();

        up.util.each(nodeList, callback);
        return expect(callback.calls.allArgs()).toEqual([[one, 0], [two, 1]]);
    });
  });

    describe('up.util.filter', function() {

      it('returns an array of those elements in the given array for which the given function returns true', function() {
        const array = ["foo", "orange", "cucumber"];
        const results = up.util.filter(array, item => item.length > 3);
        return expect(results).toEqual(['orange', 'cucumber']);
    });

      it('passes the iteration index as second argument to the given function', function() {
        const array = ["apple", "orange", "cucumber", "banana"];
        const results = up.util.filter(array, (item, index) => (index % 2) === 0);
        return expect(results).toEqual(['apple', 'cucumber']);
    });

      it('accepts a property name instead of a function, which checks that property from each item', function() {
        const array = [ { name: 'a', prop: false }, { name: 'b', prop: true } ];
        const results = up.util.filter(array, 'prop');
        return expect(results).toEqual([{ name: 'b', prop: true }]);
    });

      return it('iterates over an array-like value', function() {
        const one = fixture('.qwertz');
        const two = fixture('.qwertz');
        const nodeList = document.querySelectorAll('.qwertz');

        const callback = jasmine.createSpy();

        up.util.filter(nodeList, callback);
        return expect(callback.calls.allArgs()).toEqual([[one, 0], [two, 1]]);
    });
  });

    describe('up.util.reject', function() {

      it('returns an array of those elements in the given array for which the given function returns false', function() {
        const array = ["foo", "orange", "cucumber"];
        const results = up.util.reject(array, item => item.length < 4);
        return expect(results).toEqual(['orange', 'cucumber']);
    });

      it('passes the iteration index as second argument to the given function', function() {
        const array = ["apple", "orange", "cucumber", "banana"];
        const results = up.util.reject(array, (item, index) => (index % 2) === 0);
        return expect(results).toEqual(['orange', 'banana']);
    });

      it('accepts a property name instead of a function, which checks that property from each item', function() {
        const array = [ { name: 'a', prop: false }, { name: 'b', prop: true } ];
        const results = up.util.reject(array, 'prop');
        return expect(results).toEqual([{ name: 'a', prop: false }]);
    });

      return it('iterates over an array-like value', function() {
        const one = fixture('.qwertz');
        const two = fixture('.qwertz');
        const nodeList = document.querySelectorAll('.qwertz');

        const callback = jasmine.createSpy();

        up.util.reject(nodeList, callback);
        return expect(callback.calls.allArgs()).toEqual([[one, 0], [two, 1]]);
    });
  });

    describe('up.util.previewable', function() {

      it('wraps a function into a proxy function with an additional .promise attribute', function() {
        const fun = () => 'return value';
        const proxy = up.util.previewable(fun);
        expect(u.isFunction(proxy)).toBe(true);
        expect(u.isPromise(proxy.promise)).toBe(true);
        return expect(proxy()).toEqual('return value');
      });

      it("resolves the proxy's .promise when the inner function returns", function(done) {
        const fun = () => 'return value';
        const proxy = up.util.previewable(fun);
        const callback = jasmine.createSpy('promise callback');
        proxy.promise.then(callback);
        return u.task(function() {
          expect(callback).not.toHaveBeenCalled();
          proxy();
          return u.task(function() {
            expect(callback).toHaveBeenCalledWith('return value');
            return done();
          });
        });
      });

      return it("delays resolution of the proxy's .promise if the inner function returns a promise", function(done) {
        const funDeferred = u.newDeferred();
        const fun = () => funDeferred;
        const proxy = up.util.previewable(fun);
        const callback = jasmine.createSpy('promise callback');
        proxy.promise.then(callback);
        proxy();
        return u.task(function() {
          expect(callback).not.toHaveBeenCalled();
          funDeferred.resolve('return value');
          return u.task(function() {
            expect(callback).toHaveBeenCalledWith('return value');
            return done();
          });
        });
      });
    });

    describe('up.util.sequence', () => it('combines the given functions into a single function', function() {
      const values = [];
      const one = () => values.push('one');
      const two = () => values.push('two');
      const three = () => values.push('three');
      const sequence = up.util.sequence([one, two, three]);
      expect(values).toEqual([]);
      sequence();
      return expect(values).toEqual(['one', 'two', 'three']);
    }));

    describe('up.util.muteRejection', function() {

      it('returns a promise that fulfills when the given promise fulfills', function(done) {
        const fulfilledPromise = Promise.resolve();
        const mutedPromise = up.util.muteRejection(fulfilledPromise);

        return u.task(() => promiseState(mutedPromise).then(function(result) {
          expect(result.state).toEqual('fulfilled');
          return done();
        }));
      });

      return it('returns a promise that fulfills when the given promise rejects', function(done) {
        const rejectedPromise = Promise.reject();
        const mutedPromise = up.util.muteRejection(rejectedPromise);

        return u.task(() => promiseState(mutedPromise).then(function(result) {
          expect(result.state).toEqual('fulfilled');
          return done();
        }));
      });
    });

    describe('up.util.simpleEase', function() {

      it('returns 0 for 0', () => expect(up.util.simpleEase(0)).toBe(0));

      it('returns 1 for 1', () => expect(up.util.simpleEase(1)).toBe(1));

      return it('returns steadily increasing values between 0 and 1', function() {
        expect(up.util.simpleEase(0.25)).toBeAround(0.25, 0.2);
        expect(up.util.simpleEase(0.50)).toBeAround(0.50, 0.2);
        return expect(up.util.simpleEase(0.75)).toBeAround(0.75, 0.2);
      });
    });

    describe('up.util.timer', function() {

      it('calls the given function after waiting the given milliseconds', function(done) {
        const callback = jasmine.createSpy();
        const expectNotCalled = () => expect(callback).not.toHaveBeenCalled();
        const expectCalled = () => expect(callback).toHaveBeenCalled();

        up.util.timer(100, callback);

        expectNotCalled();
        setTimeout(expectNotCalled, 50);
        setTimeout(expectCalled, 50 + 75);
        return setTimeout(done, 50 + 75);
      });

      return describe('if the delay is zero', () => it('calls the given function in the next execution frame', function() {
        const callback = jasmine.createSpy();
        up.util.timer(0, callback);
        expect(callback).not.toHaveBeenCalled();

        return setTimeout((() => expect(callback).toHaveBeenCalled()), 0);
      }));
    });

  //    describe 'up.util.argNames', ->
  //
  //      it 'returns an array of argument names for the given function', ->
  //        fun = ($element, data) ->
  //        expect(up.util.argNames(fun)).toEqual(['$element', 'data'])

    describe('up.util.only', function() {

      it('returns a copy of the given object with only the given whitelisted properties', function() {
        const original = {
          foo: 'foo-value',
          bar: 'bar-value',
          baz: 'baz-value',
          bam: 'bam-value'
        };
        const whitelisted = up.util.only(original, 'bar', 'bam');
        expect(whitelisted).toEqual({
          bar: 'bar-value',
          bam: 'bam-value'
        });
        // Show that original did not change
        return expect(original).toEqual({
          foo: 'foo-value',
          bar: 'bar-value',
          baz: 'baz-value',
          bam: 'bam-value'
        });
      });

      return it('does not add empty keys to the returned object if the given object does not have that key', function() {
        const original =
          {foo: 'foo-value'};
        const whitelisted = up.util.only(original, 'foo', 'bar');
        expect(whitelisted).toHaveOwnProperty('foo');
        return expect(whitelisted).not.toHaveOwnProperty('bar');
      });
    });

    describe('up.util.except', () => it('returns a copy of the given object but omits the given blacklisted properties', function() {
      const original = {
        foo: 'foo-value',
        bar: 'bar-value',
        baz: 'baz-value',
        bam: 'bam-value'
      };
      const whitelisted = up.util.except(original, 'foo', 'baz');
      expect(whitelisted).toEqual({
        bar: 'bar-value',
        bam: 'bam-value'
      });
      // Show that original did not change
      return expect(original).toEqual({
        foo: 'foo-value',
        bar: 'bar-value',
        baz: 'baz-value',
        bam: 'bam-value'
      });
    }));

    describe('up.util.every', function() {

      it('returns true if all element in the array returns true for the given function', function() {
        const result = up.util.every(['foo', 'bar', 'baz'], up.util.isPresent);
        return expect(result).toBe(true);
      });

      it('returns false if an element in the array returns false for the given function', function() {
        const result = up.util.every(['foo', 'bar', null, 'baz'], up.util.isPresent);
        return expect(result).toBe(false);
      });

      it('short-circuits once an element returns false', function() {
        let count = 0;
        up.util.every(['foo', 'bar', '', 'baz'], function(element) {
          count += 1;
          return up.util.isPresent(element);
        });
        return expect(count).toBe(3);
      });

      it('passes the iteration index as second argument to the given function', function() {
        const array = ["apple", "orange", "cucumber"];
        const args = [];
        up.util.every(array, function(item, index) {
          args.push(index);
          return true;
        });
        return expect(args).toEqual([0, 1, 2]);
    });

      return it('accepts a property name instead of a function, which collects that property from each item', function() {
        const allTrue = [ { prop: true }, { prop: true } ];
        const someFalse = [ { prop: true }, { prop: false } ];
        expect(up.util.every(allTrue, 'prop')).toBe(true);
        return expect(up.util.every(someFalse, 'prop')).toBe(false);
      });
    });

  //    describe 'up.util.none', ->
  //
  //      it 'returns true if no element in the array returns true for the given function', ->
  //        result = up.util.none ['foo', 'bar', 'baz'], up.util.isBlank
  //        expect(result).toBe(true)
  //
  //      it 'returns false if an element in the array returns false for the given function', ->
  //        result = up.util.none ['foo', 'bar', null, 'baz'], up.util.isBlank
  //        expect(result).toBe(false)
  //
  //      it 'short-circuits once an element returns true', ->
  //        count = 0
  //        up.util.none ['foo', 'bar', '', 'baz'], (element) ->
  //          count += 1
  //          up.util.isBlank(element)
  //        expect(count).toBe(3)
  //
  //      it 'passes the iteration index as second argument to the given function', ->
  //        array = ["apple", "orange", "cucumber"]
  //        args = []
  //        up.util.none array, (item, index) ->
  //          args.push(index)
  //          false
  //        expect(args).toEqual [0, 1, 2]
  //
  //      it 'accepts a property name instead of a function, which collects that property from each item', ->
  //        allFalse = [ { prop: false }, { prop: false } ]
  //        someTrue = [ { prop: true }, { prop: false } ]
  //        expect(up.util.none(allFalse, 'prop')).toBe(true)
  //        expect(up.util.none(someTrue, 'prop')).toBe(false)

    describe('up.util.some', function() {

      it('returns true if at least one element in the array returns true for the given function', function() {
        const result = up.util.some(['', 'bar', null], up.util.isPresent);
        return expect(result).toBe(true);
      });

      it('returns false if no element in the array returns true for the given function', function() {
        const result = up.util.some(['', null, undefined], up.util.isPresent);
        return expect(result).toBe(false);
      });

      it('passes the iteration index as second argument to the given function', function() {
        const array = ["apple", "orange", "cucumber"];
        const args = [];
        up.util.some(array, function(item, index) {
          args.push(index);
          return false;
        });
        return expect(args).toEqual([0, 1, 2]);
    });

      it('accepts a property name instead of a function, which collects that property from each item', function() {
        const someTrue = [ { prop: true }, { prop: false } ];
        const allFalse = [ { prop: false }, { prop: false } ];
        expect(up.util.some(someTrue, 'prop')).toBe(true);
        return expect(up.util.some(allFalse, 'prop')).toBe(false);
      });

      it('short-circuits once an element returns true', function() {
        let count = 0;
        up.util.some([null, undefined, 'foo', ''], function(element) {
          count += 1;
          return up.util.isPresent(element);
        });
        return expect(count).toBe(3);
      });

      return it('iterates over an array-like value', function() {
        const one = fixture('.qwertz');
        const two = fixture('.qwertz');
        const nodeList = document.querySelectorAll('.qwertz');

        const callback = jasmine.createSpy();

        up.util.some(nodeList, callback);
        return expect(callback.calls.allArgs()).toEqual([[one, 0], [two, 1]]);
    });
  });

    describe('up.util.findResult', function() {

      it('consecutively applies the function to each array element and returns the first truthy return value', function() {
        const map = {
          a: '',
          b: null,
          c: undefined,
          d: 'DEH',
          e: 'EH'
        };
        const fn = el => map[el];

        const result = up.util.findResult(['a', 'b', 'c', 'd', 'e'], fn);
        return expect(result).toEqual('DEH');
      });

      it('returns undefined if the function does not return a truthy value for any element in the array', function() {
        const map = {};
        const fn = el => map[el];

        const result = up.util.findResult(['a', 'b', 'c'], fn);
        return expect(result).toBeUndefined();
      });

      return it('iterates over an array-like value', function() {
        const one = fixture('.qwertz');
        const two = fixture('.qwertz');
        const nodeList = document.querySelectorAll('.qwertz');

        const callback = jasmine.createSpy();

        up.util.findResult(nodeList, callback);
        return expect(callback.calls.allArgs()).toEqual([[one, 0], [two, 1]]);
    });
  });

    describe('up.util.isBlank', function() {

      it('returns false for false', () => expect(up.util.isBlank(false)).toBe(false));

      it('returns false for true', () => expect(up.util.isBlank(true)).toBe(false));

      it('returns true for null', () => expect(up.util.isBlank(null)).toBe(true));

      it('returns true for undefined', () => expect(up.util.isBlank(undefined)).toBe(true));

      it('returns true for an empty String', () => expect(up.util.isBlank('')).toBe(true));

      it('returns false for a String with at least one character', () => expect(up.util.isBlank('string')).toBe(false));

      it('returns true for an empty array', () => expect(up.util.isBlank([])).toBe(true));

      it('returns false for an array with at least one element', () => expect(up.util.isBlank(['element'])).toBe(false));

      it('returns true for an empty jQuery collection', () => expect(up.util.isBlank($([]))).toBe(true));

      it('returns false for a jQuery collection with at least one element', () => expect(up.util.isBlank($('body'))).toBe(false));

      it('returns true for an empty object', () => expect(up.util.isBlank({})).toBe(true));

      it('returns false for a function', () => expect(up.util.isBlank((function() {}))).toBe(false));

      it('returns true for an object with at least one key', () => expect(up.util.isBlank({key: 'value'})).toBe(false));

      it('returns true for an object with an [up.util.isBlank.key] method that returns true', function() {
        const value = {};
        value[up.util.isBlank.key] = () => true;
        return expect(up.util.isBlank(value)).toBe(true);
      });

      it('returns false for an object with an [up.util.isBlank.key] method that returns false', function() {
        const value = {};
        value[up.util.isBlank.key] = () => false;
        return expect(up.util.isBlank(value)).toBe(false);
      });

      return it('returns false for a DOM element', function() {
        const value = document.body;
        return expect(up.util.isBlank(value)).toBe(false);
      });
    });

    describe('up.util.normalizeUrl', function() {

      it('normalizes a relative path', function() {
        up.history.config.enabled = true;
        up.history.replace('/qux/');
        return expect(up.util.normalizeUrl('foo')).toBe(`http://${location.hostname}:${location.port}/qux/foo`);
      });

      it('normalizes an absolute path', () => expect(up.util.normalizeUrl('/foo')).toBe(`http://${location.hostname}:${location.port}/foo`));

      it('normalizes a full URL', () => expect(up.util.normalizeUrl('http://example.com/foo/bar')).toBe('http://example.com/foo/bar'));

      it('preserves a query string', () => expect(up.util.normalizeUrl('http://example.com/foo/bar?key=value')).toBe('http://example.com/foo/bar?key=value'));

      it('strips a query string with { search: false } option', () => expect(up.util.normalizeUrl('http://example.com/foo/bar?key=value', {search: false})).toBe('http://example.com/foo/bar'));

      it('does not strip a trailing slash by default', () => expect(up.util.normalizeUrl('/foo/')).toEqual(`http://${location.hostname}:${location.port}/foo/`));

      it('normalizes redundant segments', () => expect(up.util.normalizeUrl('/foo/../foo')).toBe(`http://${location.hostname}:${location.port}/foo`));

      it('strips a #hash by default', () => expect(up.util.normalizeUrl('http://example.com/foo/bar#fragment')).toBe('http://example.com/foo/bar'));

      it('preserves a #hash with { hash: true } option', () => expect(up.util.normalizeUrl('http://example.com/foo/bar#fragment', {hash: true})).toBe('http://example.com/foo/bar#fragment'));

      return it('puts a #hash behind the query string', () => expect(up.util.normalizeUrl('http://example.com/foo/bar?key=value#fragment', {hash: true})).toBe('http://example.com/foo/bar?key=value#fragment'));
    });

    describe('up.util.find', function() {

      it('finds the first element in the given array that matches the given tester', function() {
        const array = ['foo', 'bar', 'baz'];
        const tester = element => element[0] === 'b';
        return expect(up.util.find(array, tester)).toEqual('bar');
      });

      return it("returns undefined if the given array doesn't contain a matching element", function() {
        const array = ['foo', 'bar', 'baz'];
        const tester = element => element[0] === 'z';
        return expect(up.util.find(array, tester)).toBeUndefined();
      });
    });

    describe('up.util.remove', function() {

      it('removes the given string from the given array', function() {
        const array = ['a', 'b', 'c'];
        up.util.remove(array, 'b');
        return expect(array).toEqual(['a', 'c']);
    });

      return it('removes the given object from the given array', function() {
        const obj1 = { 'key': 1 };
        const obj2 = { 'key': 2 };
        const obj3 = { 'key': 3 };
        const array = [obj1, obj2, obj3];
        up.util.remove(array, obj2);
        return expect(array).toEqual([obj1, obj3]);
    });
  });

    describe('up.util.unresolvablePromise', function() {

      it('return a pending promise', function(done) {
        const promise = up.util.unresolvablePromise();
        return promiseState(promise).then(function(result) {
          expect(result.state).toEqual('pending');
          return done();
        });
      });

      return it('returns a different object every time (to prevent memory leaks)', function() {
        const one = up.util.unresolvablePromise();
        const two = up.util.unresolvablePromise();
        return expect(one).not.toBe(two);
      });
    });

    describe('up.util.flatten', function() {

      it('flattens the given array', function() {
        const array = [1, [2, 3], 4];
        return expect(u.flatten(array)).toEqual([1, 2, 3, 4]);
      });

      return it('only flattens one level deep for performance reasons', function() {
        const array = [1, [2, [3,4]], 5];
        return expect(u.flatten(array)).toEqual([1, 2, [3, 4], 5]);
      });
    });

    describe('up.util.renameKey', () => it('renames a key in the given property', function() {
      const object = { a: 'a value', b: 'b value'};
      u.renameKey(object, 'a', 'c');
      expect(object.a).toBeUndefined();
      expect(object.b).toBe('b value');
      return expect(object.c).toBe('a value');
    }));

  //    describe 'up.util.offsetParent', ->
  //
  //      it 'returns the first ascendant that has a "position" style', ->
  //        $a = $fixture('.a')
  //        $b = $a.affix('.b').css(position: 'relative')
  //        $c = $b.affix('.c')
  //        $d = $c.affix('.d')
  //
  //        expect(up.util.offsetParent($d[0])).toBe($b[0])
  //
  //      it 'does not return the given element, even when it has position', ->
  //        $a = $fixture('.a').css(position: 'absolute')
  //        $b = $a.affix('.b').css(position: 'relative')
  //
  //        expect(up.util.offsetParent($b[0])).toBe($a[0])
  //
  //      it 'returns the <body> element if there is no closer offset parent', ->
  //        $a = $fixture('.a')
  //        $b = $a.affix('.b')
  //
  //        expect(up.util.offsetParent($b[0])).toBe(document.body)
  //
  //      it 'returns the offset parent for a detached element', ->
  //        $a = $fixture('.a').detach()
  //        $b = $a.affix('.b').css(position: 'relative')
  //        $c = $b.affix('.c')
  //        $d = $c.affix('.d')
  //
  //        expect(up.util.offsetParent($d[0])).toBe($b[0])
  //
  //      it 'returns a missing value (and not <body>) if the given detached element has no ancestor with position', ->
  //        $a = $fixture('.a').detach()
  //        $b = $a.affix('.b')
  //
  //        expect(up.util.offsetParent($b[0])).toBeMissing()

    describe('up.util.isCrossDomain', function() {

      it('returns false for an absolute path', () => expect(up.util.isCrossDomain('/foo')).toBe(false));

      it('returns false for an relative path', () => expect(up.util.isCrossDomain('foo')).toBe(false));

      it('returns false for a fully qualified URL with the same protocol and hostname as the current location', function() {
        const fullUrl = `${location.protocol}//${location.host}/foo`;
        return expect(up.util.isCrossDomain(fullUrl)).toBe(false);
      });

      it('returns true for a fully qualified URL with a different protocol than the current location', function() {
        const fullUrl = `otherprotocol://${location.host}/foo`;
        return expect(up.util.isCrossDomain(fullUrl)).toBe(true);
      });

      return it('returns false for a fully qualified URL with a different hostname than the current location', function() {
        const fullUrl = `${location.protocol}//other-host.tld/foo`;
        return expect(up.util.isCrossDomain(fullUrl)).toBe(true);
      });
    });

    describe('up.util.isOptions', function() {

      it('returns true for an Object instance', () => expect(up.util.isOptions(new Object())).toBe(true));

      it('returns true for an object literal', () => expect(up.util.isOptions({ foo: 'bar'})).toBe(true));

      it('returns true for a prototype-less object', () => expect(up.util.isOptions(Object.create(null))).toBe(true));

      it('returns false for undefined', () => expect(up.util.isOptions(undefined)).toBe(false));

      it('returns false for null', () => expect(up.util.isOptions(null)).toBe(false));

      it('returns false for a function (which is technically an object)', function() {
        const fn = () => 'foo';
        fn.key = 'value';
        return expect(up.util.isOptions(fn)).toBe(false);
      });

      it('returns false for an Array', () => expect(up.util.isOptions(['foo'])).toBe(false));

      it('returns false for a jQuery collection', () => expect(up.util.isOptions($('body'))).toBe(false));

      it('returns false for a Promise', () => expect(up.util.isOptions(Promise.resolve())).toBe(false));

      it('returns false for a FormData object', () => expect(up.util.isOptions(new FormData())).toBe(false));

      it('returns false for a Date', () => expect(up.util.isOptions(new Date())).toBe(false));

      return it('returns false for a RegExp', () => expect(up.util.isOptions(new RegExp('foo'))).toBe(false));
    });

    describe('up.util.isObject', function() {

      it('returns true for an Object instance', () => expect(up.util.isObject(new Object())).toBe(true));

      it('returns true for an object literal', () => expect(up.util.isObject({ foo: 'bar'})).toBe(true));

      it('returns false for undefined', () => expect(up.util.isObject(undefined)).toBe(false));

      it('returns false for null', () => expect(up.util.isObject(null)).toBe(false));

      it('returns true for a function (which is technically an object)', function() {
        const fn = () => 'foo';
        fn.key = 'value';
        return expect(up.util.isObject(fn)).toBe(true);
      });

      it('returns true for an array', () => expect(up.util.isObject(['foo'])).toBe(true));

      it('returns true for a jQuery collection', () => expect(up.util.isObject($('body'))).toBe(true));

      it('returns true for a promise', () => expect(up.util.isObject(Promise.resolve())).toBe(true));

      return it('returns true for a FormData object', () => expect(up.util.isObject(new FormData())).toBe(true));
    });

    describe('up.util.merge', function() {

      it('merges the given objects', function() {
        let obj = { a: '1', b: '2' };
        const other = { b: '3', c: '4' };
        obj = up.util.merge(obj, other);
        return expect(obj).toEqual({ a: '1', b: '3', c: '4' });
    });

      it('overrides (not merges) keys with object value', function() {
        let obj = { a: '1', b: { c: '2', d: '3' } };
        const other = { e: '4', b: { f: '5', g: '6' }};
        obj = up.util.merge(obj, other);
        return expect(obj).toEqual({ a: '1', e: '4', b: { f: '5', g: '6' } });
    });

      it('ignores undefined arguments', function() {
        const obj = { a: 1, b: 2 };

        const result = up.util.merge(obj, undefined);
        expect(result).toEqual({ a: 1, b: 2 });

        const reverseResult = up.util.merge(undefined, obj);
        return expect(reverseResult).toEqual({ a: 1, b: 2 });
    });

      return it('ignores null arguments', function() {
        const obj = { a: 1, b: 2 };

        const result = up.util.merge(obj, null);
        expect(result).toEqual({ a: 1, b: 2 });

        const reverseResult = up.util.merge(null, obj);
        return expect(reverseResult).toEqual({ a: 1, b: 2 });
    });
  });

  //    describe 'up.util.deepMerge', ->
  //
  //      it 'recursively merges the given objects', ->
  //        obj = { a: '1', b: { c: '2', d: '3' } }
  //        other = { e: '4', b: { f: '5', g: '6' }}
  //        obj = up.util.deepMerge(obj, other)
  //        expect(obj).toEqual { a: '1', e: '4', b: { c: '2', d: '3', f: '5', g: '6' } }
  //
  //      it 'ignores undefined arguments', ->
  //        obj = { a: 1, b: 2 }
  //
  //        result = up.util.deepMerge(obj, undefined)
  //        expect(result).toEqual { a: 1, b: 2 }
  //
  //        reverseResult = up.util.deepMerge(undefined, obj)
  //        expect(reverseResult).toEqual { a: 1, b: 2 }
  //
  //      it 'ignores null arguments', ->
  //        obj = { a: 1, b: 2 }
  //
  //        result = up.util.deepMerge(obj, null)
  //        expect(result).toEqual { a: 1, b: 2 }
  //
  //        reverseResult = up.util.deepMerge(null, obj)
  //        expect(reverseResult).toEqual { a: 1, b: 2 }
  //
  //      it 'overwrites (and does not concatenate) array values', ->
  //        obj = { a: ['1', '2'] }
  //        other = { a: ['3', '4'] }
  //        obj = up.util.deepMerge(obj, other)
  //        expect(obj).toEqual { a: ['3', '4'] }

    describe('up.util.memoize', function() {

      it('returns a function that calls the memoized function', function() {
        const fun = (a, b) => a + b;
        const memoized = u.memoize(fun);
        return expect(memoized(2, 3)).toEqual(5);
      });

      return it('returns the cached return value of the first call when called again', function() {
        const spy = jasmine.createSpy().and.returnValue(5);
        const memoized = u.memoize(spy);
        expect(memoized(2, 3)).toEqual(5);
        expect(memoized(2, 3)).toEqual(5);
        return expect(spy.calls.count()).toEqual(1);
      });
    });

    ['assign', 'assignPolyfill'].forEach(assignVariant => describe(`up.util.${assignVariant}`, function() {

      const assign = up.util[assignVariant];

      it('copies the second object into the first object', function() {
        const target = { a: 1 };
        const source = { b: 2, c: 3 };

        assign(target, source);

        expect(target).toEqual({ a: 1, b: 2, c: 3 });

        // Source is unchanged
        return expect(source).toEqual({ b: 2, c: 3 });
    });

      it('copies null property values', function() {
        const target = { a: 1, b: 2 };
        const source = { b: null };

        assign(target, source);

        return expect(target).toEqual({ a: 1, b: null });
    });

      it('copies undefined property values', function() {
        const target = { a: 1, b: 2 };
        const source = { b: undefined };

        assign(target, source);

        return expect(target).toEqual({ a: 1, b: undefined });
    });

      it('returns the first object', function() {
        const target = { a: 1 };
        const source = { b: 2 };

        const result = assign(target, source);

        return expect(result).toBe(target);
      });

      return it('takes multiple sources to copy from', function() {
        const target = { a: 1 };
        const source1 = { b: 2, c: 3 };
        const source2 = { d: 4, e: 5 };

        assign(target, source1, source2);

        return expect(target).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
    });
  }));

    describe('up.util.copy', function() {

      it('returns a shallow copy of the given array', function() {
        const original = ['a', { b: 'c' }, 'd'];

        const copy = up.util.copy(original);
        expect(copy).toEqual(original);

        // Test that changes to copy don't change original
        copy.pop();
        expect(copy.length).toBe(2);
        expect(original.length).toBe(3);

        // Test that the copy is shallow
        copy[1].x = 'y';
        return expect(original[1].x).toEqual('y');
      });

      it('returns a shallow copy of the given plain object', function() {
        const original = {a: 'b', c: [1, 2], d: 'e'};

        const copy = up.util.copy(original);
        expect(copy).toEqual(original);

        // Test that changes to copy don't change original
        copy.f = 'g';
        expect(original.f).toBeMissing();

        // Test that the copy is shallow
        copy.c.push(3);
        return expect(original.c).toEqual([1, 2, 3]);
    });

      it('allows custom classes to hook into the copy protocol by implementing a method named `up.util.copy.key`', function() {
        class TestClass {
          [up.util.copy.key]() {
            return "custom copy";
          }
        }

        const instance = new TestClass();
        return expect(up.util.copy(instance)).toEqual("custom copy");
      });

      it('copies the given jQuery collection into an array', function() {
        const $one = $fixture('.one');
        const $two = $fixture('.two');
        const $collection = $one.add($two);

        const copy = up.util.copy($collection);

        copy[0] = document.body;
        return expect($collection[0]).toBe($one[0]);
      });

      it('copies the given arguments object into an array', function() {
        let args = undefined;
        (function() { return args = arguments; })(1);

        const copy = up.util.copy(args);
        expect(copy).toBeArray();

        copy[0] = 2;
        return expect(args[0]).toBe(1);
      });

      it('returns the given string (which is immutable)', function() {
        const str = "foo";
        const copy = up.util.copy(str);
        return expect(copy).toBe(str);
      });

      it('returns the given number (which is immutable)', function() {
        const number = 123;
        const copy = up.util.copy(number);
        return expect(copy).toBe(number);
      });

      return it('copies the given Date object', function() {
        const date = new Date('1995-12-17T03:24:00');
        expect(date.getFullYear()).toBe(1995);

        const copy = up.util.copy(date);

        expect(copy.getFullYear()).toBe(1995);
        expect(copy.getHours()).toBe(3);
        expect(copy.getMinutes()).toBe(24);

        date.setFullYear(2018);

        return expect(copy.getFullYear()).toBe(1995);
      });
    });


    describe('up.util.deepCopy', function() {

      it('returns a deep copy of the given array', function() {
        const original = ['a', { b: 'c' }, 'd'];

        const copy = up.util.deepCopy(original);
        expect(copy).toEqual(original);

        // Test that changes to copy don't change original
        copy.pop();
        expect(copy.length).toBe(2);
        expect(original.length).toBe(3);

        // Test that the copy is deep
        copy[1].x = 'y';
        return expect(original[1].x).toBeUndefined();
      });

      return it('returns a deep copy of the given object', function() {
        const original = {a: 'b', c: [1, 2], d: 'e'};

        const copy = up.util.deepCopy(original);
        expect(copy).toEqual(original);

        // Test that changes to copy don't change original
        copy.f = 'g';
        expect(original.f).toBeMissing();

        // Test that the copy is deep
        copy.c.push(3);
        return expect(original.c).toEqual([1, 2]);
    });
  });

    describe('up.util.isList', function() {

      it('returns true for an array', function() {
        const value = [1, 2, 3];
        return expect(up.util.isList(value)).toBe(true);
      });

      it('returns true for an HTMLCollection', function() {
        const value = document.getElementsByTagName('div');
        return expect(up.util.isList(value)).toBe(true);
      });

      it('returns true for a NodeList', function() {
        const value = document.querySelectorAll('div');
        return expect(up.util.isList(value)).toBe(true);
      });

      it('returns true for an arguments object', function() {
        let value = undefined;
        (function() { return value = arguments; })();
        return expect(up.util.isList(value)).toBe(true);
      });

      it('returns false for an object', function() {
        const value = { foo: 'bar' };
        return expect(up.util.isList(value)).toBe(false);
      });

      it('returns false for a string', function() {
        const value = 'foo';
        return expect(up.util.isList(value)).toBe(false);
      });

      it('returns false for a number', function() {
        const value = 123;
        return expect(up.util.isList(value)).toBe(false);
      });

      it('returns false for undefined', function() {
        const value = undefined;
        return expect(up.util.isList(value)).toBe(false);
      });

      it('returns false for null', function() {
        const value = null;
        return expect(up.util.isList(value)).toBe(false);
      });

      return it('returns false for NaN', function() {
        const value = NaN;
        return expect(up.util.isList(value)).toBe(false);
      });
    });

    return describe('up.util.isJQuery', function() {

      it('returns true for a jQuery collection', function() {
        const value = $('body');
        return expect(up.util.isJQuery(value)).toBe(true);
      });

      it('returns false for a native element', function() {
        const value = document.body;
        return expect(up.util.isJQuery(value)).toBe(false);
      });

      return it('returns false (and does not crash) for undefined', function() {
        const value = undefined;
        return expect(up.util.isJQuery(value)).toBe(false);
      });
    });
  }));
})();