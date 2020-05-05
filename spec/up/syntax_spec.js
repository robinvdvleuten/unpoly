/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.syntax', () => describe('JavaScript functions', function() {

    describe('up.compiler', function() {
      
      it('applies an event initializer whenever a matching fragment is inserted', function() {
        const observeElement = jasmine.createSpy();
        up.compiler('.child', element => observeElement(element));

        const $container = $fixture('.container');
        const $child = $container.affix('.child');
        const $otherChild = $container.affix('.other-child');

        up.hello($container[0]);
  
        expect(observeElement).not.toHaveBeenCalledWith($container[0]);
        expect(observeElement).not.toHaveBeenCalledWith($otherChild[0]);
        return expect(observeElement).toHaveBeenCalledWith($child[0]);
      });

      describe('destructors', function() {

        it('allows compilers to return a function to call when the compiled element is destroyed', asyncSpec(function(next) {
          const destructor = jasmine.createSpy('destructor');
          up.compiler('.child', element => destructor);

          up.hello(fixture('.container .child'));

          next(() => {
            expect(destructor).not.toHaveBeenCalled();
            return up.destroy('.container');
          });

          return next(() => {
            return expect(destructor).toHaveBeenCalled();
          });
        })
        );

        it('allows compilers to return an array of functions to call when the compiled element is destroyed', asyncSpec(function(next) {
          const destructor1 = jasmine.createSpy('destructor1');
          const destructor2 = jasmine.createSpy('destructor2');
          up.compiler('.child', element => [ destructor1, destructor2 ]);

          up.hello(fixture('.container .child'));

          next(() => {
            expect(destructor1).not.toHaveBeenCalled();
            expect(destructor2).not.toHaveBeenCalled();

            return up.destroy('.container');
          });

          return next(() => {
            expect(destructor1).toHaveBeenCalled();
            return expect(destructor2).toHaveBeenCalled();
          });
        })
        );

        it("does not consider a returned array to be a destructor unless it's comprised entirely of functions", asyncSpec(function(next) {
          const value1 = jasmine.createSpy('non-destructor');
          const value2 = 'two';
          up.compiler('.child', element => [ value1, value2 ]);

          up.hello(fixture('.container .child'));

          next(() => {
            expect(value1).not.toHaveBeenCalled();

            return up.destroy('.container');
          });

          return next(() => {
            return expect(value1).not.toHaveBeenCalled();
          });
        })
        );

        it('runs all destructors if multiple compilers are applied to the same element', asyncSpec(function(next) {
          const destructor1 = jasmine.createSpy('destructor1');
          up.compiler('.one', element => destructor1);
          const destructor2 = jasmine.createSpy('destructor2');
          up.compiler('.two', element => destructor2);

          const $element = $fixture('.one.two');
          up.hello($element);

          next(() => {
            expect(destructor1).not.toHaveBeenCalled();
            expect(destructor2).not.toHaveBeenCalled();

            return up.destroy($element[0]);
          });

          return next(() => {
            expect(destructor1).toHaveBeenCalled();
            return expect(destructor2).toHaveBeenCalled();
          });
        })
        );

        return it('does not throw an error if both container and child have a destructor, and the container gets destroyed', asyncSpec(function(next) {
          up.compiler('.container', element => (function() {}));

          up.compiler('.child', element => (function() {}));

          const promise = up.destroy('.container');

          return promiseState(promise).then(result => expect(result.state).toEqual('fulfilled'));
        })
        );
      });

      describe('passing of [up-data]', function() {

        it('parses an [up-data] attribute as JSON and passes the parsed object as a second argument to the compiler', function() {
          const observeArgs = jasmine.createSpy();
          up.compiler('.child', (element, data) => observeArgs(element.className, data));

          const data = { key1: 'value1', key2: 'value2' };

          const $tag = $fixture(".child").attr('up-data', JSON.stringify(data));
          up.hello($tag[0]);

          return expect(observeArgs).toHaveBeenCalledWith('child', data);
        });

        it('passes an empty object as a second argument to the compiler if there is no [up-data] attribute', function() {
          const observeArgs = jasmine.createSpy();
          up.compiler('.child', (element, data) => observeArgs(element.className, data));

          up.hello(fixture(".child"));

          return expect(observeArgs).toHaveBeenCalledWith('child', {});
        });

        return it('does not parse an [up-data] attribute if the compiler function only takes a single argument', function() {
          const parseDataSpy = spyOn(up.syntax, 'data').and.returnValue({});

          const $child = $fixture(".child");

          up.compiler('.child', function(element) {}); // no-op
          up.hello($child);

          return expect(parseDataSpy).not.toHaveBeenCalled();
        });
      });

      it('compiles multiple matching elements one-by-one', function() {
        const compiler = jasmine.createSpy('compiler');
        up.compiler('.foo', element => compiler(element));
        const $container = $fixture('.container');
        const $first = $container.affix('.foo.first');
        const $second = $container.affix('.foo.second');
        up.hello($container[0]);
        expect(compiler.calls.count()).toEqual(2);
        expect(compiler).toHaveBeenCalledWith($first[0]);
        return expect(compiler).toHaveBeenCalledWith($second[0]);
      });

      describe('with { batch } option', function() {

        it('compiles all matching elements at once', function() {
          const compiler = jasmine.createSpy('compiler');
          up.compiler('.foo', { batch: true }, elements => compiler(elements));
          const $container = $fixture('.container');
          const first = $container.affix('.foo.first')[0];
          const second = $container.affix('.foo.second')[0];
          up.hello($container);
          expect(compiler.calls.count()).toEqual(1);
          return expect(compiler).toHaveBeenCalledWith([first, second]);
        });

        return it('throws an error if the batch compiler returns a destructor', function() {
          const destructor = function() {};
          up.compiler('.element', { batch: true }, element => destructor);
          const $container = $fixture('.element');
          const compile = () => up.hello($container);
          return expect(compile).toThrowError(/cannot return destructor/i);
        });
      });

      describe('with { keep } option', () => it('adds an up-keep attribute to the fragment during compilation', function() {

        up.compiler('.foo', { keep: true }, function() {});
        up.compiler('.bar', { }, function() {});
        up.compiler('.bar', { keep: false }, function() {});
        up.compiler('.bam', { keep: '.partner' }, function() {});

        const $foo = $(up.hello(fixture('.foo')));
        const $bar = $(up.hello(fixture('.bar')));
        const $baz = $(up.hello(fixture('.baz')));
        const $bam = $(up.hello(fixture('.bam')));

        expect($foo.attr('up-keep')).toEqual('');
        expect($bar.attr('up-keep')).toBeMissing();
        expect($baz.attr('up-keep')).toBeMissing();
        return expect($bam.attr('up-keep')).toEqual('.partner');
      }));

      return describe('with { priority } option', function() {

        it('runs compilers with higher priority first', function() {
          const traces = [];
          up.compiler('.element', { priority: 1 }, () => traces.push('foo'));
          up.compiler('.element', { priority: 2 }, () => traces.push('bar'));
          up.compiler('.element', { priority: 0 }, () => traces.push('baz'));
          up.compiler('.element', { priority: 3 }, () => traces.push('bam'));
          up.compiler('.element', { priority: -1 }, () => traces.push('qux'));
          up.hello(fixture('.element'));
          return expect(traces).toEqual(['bam', 'bar', 'foo', 'baz', 'qux']);
      });

        it('considers priority-less compilers to be priority zero', function() {
          const traces = [];
          up.compiler('.element', { priority: 1 }, () => traces.push('foo'));
          up.compiler('.element', () => traces.push('bar'));
          up.compiler('.element', { priority: -1 }, () => traces.push('baz'));
          up.hello(fixture('.element'));
          return expect(traces).toEqual(['foo', 'bar', 'baz']);
      });

        return it('runs two compilers with the same priority in the order in which they were registered', function() {
          const traces = [];
          up.compiler('.element', { priority: 1 }, () => traces.push('foo'));
          up.compiler('.element', { priority: 1 }, () => traces.push('bar'));
          up.hello(fixture('.element'));
          return expect(traces).toEqual(['foo', 'bar']);
      });
    });
  });

    describe('up.$compiler', () => it('registers a compiler that receives the element as a jQuery collection', function() {
      const observeElement = jasmine.createSpy();
      up.$compiler('.element', $element => observeElement($element));

      const $element = $fixture('.element');
      up.hello($element);

      expect(observeElement).toHaveBeenCalled();
      const arg = observeElement.calls.argsFor(0)[0];
      expect(arg).toBeJQuery();
      return expect(arg).toEqual($element);
    }));

    describe('up.macro', function() {

      it('registers compilers that are run before other compilers', function() {
        const traces = [];
        up.compiler('.element', { priority: 10 }, () => traces.push('foo'));
        up.compiler('.element', { priority: -1000 }, () => traces.push('bar'));
        up.macro('.element', () => traces.push('baz'));
        up.hello(fixture('.element'));
        return expect(traces).toEqual(['baz', 'foo' , 'bar']);
    });

      it('allows to macros to have priorities of their own', function() {
        const traces = [];
        up.macro('.element', { priority: 1 }, () => traces.push('foo'));
        up.macro('.element', { priority: 2 }, () => traces.push('bar'));
        up.macro('.element', { priority: 0 }, () => traces.push('baz'));
        up.macro('.element', { priority: 3 }, () => traces.push('bam'));
        up.macro('.element', { priority: -1 }, () => traces.push('qux'));
        up.compiler('.element', { priority: 999 }, () => traces.push('ccc'));
        up.hello(fixture('.element'));
        return expect(traces).toEqual(['bam', 'bar', 'foo', 'baz', 'qux', 'ccc']);
    });

      it('runs two macros with the same priority in the order in which they were registered', function() {
        const traces = [];
        up.macro('.element', { priority: 1 }, () => traces.push('foo'));
        up.macro('.element', { priority: 1 }, () => traces.push('bar'));
        up.hello(fixture('.element'));
        return expect(traces).toEqual(['foo', 'bar']);
    });

      it('allows users to use the built-in [up-expand] from their own macros', function() {
        up.macro('.element', element => element.setAttribute('up-expand', ''));
        const $element = $fixture('.element a[href="/foo"][up-target=".target"]');
        up.hello($element);
        expect($element.attr('up-target')).toEqual('.target');
        return expect($element.attr('up-href')).toEqual('/foo');
      });

      return it('allows users to use the built-in [up-dash] from their own macros', function() {
        up.macro('.element', element => element.setAttribute('up-dash', '.target'));
        const $element = $fixture('a.element[href="/foo"]');
        up.hello($element);
        expect($element.attr('up-target')).toEqual('.target');
        expect($element.attr('up-preload')).toEqual('');
        return expect($element.attr('up-instant')).toEqual('');
      });
    });

    describe('up.$macro', () => it('registers a macro that receives the element as a jQuery collection', function() {
      const observeElement = jasmine.createSpy();
      up.$macro('.element', $element => observeElement('macro', $element));
      up.$compiler('.element', $element => observeElement('compiler', $element));

      const $element = $fixture('.element');
      up.hello($element);

      expect(observeElement).toHaveBeenCalled();
      const args = observeElement.calls.argsFor(0);
      expect(args[0]).toEqual('macro');
      expect(args[1]).toBeJQuery();
      return expect(args[1]).toEqual($element);
    }));

    describe('up.hello', () => it('should have tests'));
      
    return describe('up.syntax.data', function() {

      it('returns the [up-data] attribute of the given element, parsed as JSON', function() {
        const $element = $fixture('.element').attr('up-data', '{ "foo": 1, "bar": 2 }');
        const data = up.syntax.data($element);
        return expect(data).toEqual({foo: 1, bar: 2});
      });

      return it('returns en empty object if the given element has no [up-data] attribute', function() {
        const $element = $fixture('.element');
        const data = up.syntax.data($element);
        return expect(data).toEqual({});
      });
    });
  }));
})();