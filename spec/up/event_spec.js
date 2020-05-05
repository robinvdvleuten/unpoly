/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const e = up.element;
  const $ = jQuery;

  describe('up.event', () => describe('JavaScript functions', function() {

    describe('up.on', function() {

      it('registers a delagating event listener to the document, which passes the element as a second argument to the listener', asyncSpec(function(next) {
        fixture('.container .child');
        const observeClass = jasmine.createSpy();
        up.on('click', '.child', (event, element) => observeClass(element.className));

        Trigger.click($('.container'));
        Trigger.click($('.child'));

        return next(() => {
          expect(observeClass).not.toHaveBeenCalledWith('container');
          return expect(observeClass).toHaveBeenCalledWith('child');
        });
      })
      );

      it('calls the event listener if the event was triggered on a child of the requested selector', asyncSpec(function(next) {
        const $container = $fixture('.container');
        const $child = $container.affix('.child');
        const listener = jasmine.createSpy();
        up.on('click', '.container', listener);

        Trigger.click($('.child'));

        return next(() => {
          return expect(listener).toHaveBeenCalledWith(
            jasmine.any(MouseEvent),
            $container[0],
            {}
          );
        });
      })
      );

      it('passes the event target as the second argument if no selector was passed to up.on()', asyncSpec(function(next) {
        const $element = $fixture('.element');
        const listener = jasmine.createSpy();
        up.on('click', listener);
        Trigger.click($element);

        return next(() => {
          return expect(listener).toHaveBeenCalledWith(
            jasmine.any(MouseEvent),
            $element[0],
            {}
          );
        });
      })
      );

      it('allows to bind the listener to a given element', asyncSpec(function(next) {
        const element1 = fixture('.element');
        const element2 = fixture('.element');
        const listener = jasmine.createSpy();
        up.on(element1, 'click', listener);
        Trigger.click(element1);

        return next(function() {
          expect(listener).toHaveBeenCalledWith(
            jasmine.any(MouseEvent),
            element1,
            {}
          );
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );

      it('allows to bind the listener to a given element while also passing a selector', asyncSpec(function(next) {
        const element1 = fixture('.element.one');
        const element2 = fixture('.element.two');
        const element2Child1 = e.affix(element2, '.child.one');
        const element2Child2 = e.affix(element2, '.child.two');
        const listener = jasmine.createSpy('event listener');
        up.on(element2, 'click', '.one', listener);

        Trigger.click(element2Child1);

        return next(function() {
          expect(listener).toHaveBeenCalledWith(
            jasmine.any(MouseEvent),
            element2Child1,
            {}
          );
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );


      it('allows to bind the listener to an array of elements at once', asyncSpec(function(next) {
        const element1 = fixture('.element');
        const element2 = fixture('.element');
        const listener = jasmine.createSpy();

        const unbindAll = up.on([element1, element2], 'click', listener);

        Trigger.click(element1);

        next(() => {
          expect(listener.calls.count()).toBe(1);
          expect(listener.calls.argsFor(0)[1]).toBe(element1);

          return Trigger.click(element2);
        });

        next(() => {
          expect(listener.calls.count()).toBe(2);
          expect(listener.calls.argsFor(1)[1]).toBe(element2);

          unbindAll();

          Trigger.click(element1);
          return Trigger.click(element2);
        });

        return next(() => {
          return expect(listener.calls.count()).toBe(2);
        });
      })
      );

      it('allows to explicitly bind a listener to the document', asyncSpec(function(next) {
        const listener = jasmine.createSpy();
        up.on(document, 'foo', listener);
        up.emit(document, 'foo');

        return next(function() {
          expect(listener).toHaveBeenCalledWith(
            jasmine.any(Event),
            document,
            {}
          );
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );

      it('allows to bind a listener to the window', asyncSpec(function(next) {
        const listener = jasmine.createSpy();
        up.on(window, 'foo', listener);
        up.emit(window, 'foo');

        return next(function() {
          expect(listener).toHaveBeenCalledWith(
            jasmine.any(Event),
            window,
            {}
          );
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );

      it('registers the listener to multiple, space-separated events', function() {
        const listener = jasmine.createSpy();

        up.on('foo bar', listener);

        up.emit('foo');
        expect(listener.calls.count()).toEqual(1);

        up.emit('bar');
        return expect(listener.calls.count()).toEqual(2);
      });

  //      it 'registers the listener to an array of event names', ->
  //        listener = jasmine.createSpy()
  //
  //        up.on ['foo', 'bar'], listener
  //
  //        up.emit('foo')
  //        expect(listener.calls.count()).toEqual(1)
  //
  //        up.emit('bar')
  //        expect(listener.calls.count()).toEqual(2)

      it('returns a method that unregisters the event listener when called', asyncSpec(function(next) {
        const $child = $fixture('.child');
        const clickSpy = jasmine.createSpy();
        const unsubscribe = up.on('click', '.child', clickSpy);
        Trigger.click($('.child'));

        next(() => {
          expect(clickSpy.calls.count()).toEqual(1);
          unsubscribe();
          return Trigger.click($('.child'));
        });

        return next(() => {
          return expect(clickSpy.calls.count()).toEqual(1);
        });
      })
      );

      it('throws an error when trying to register the same callback multiple times', function() {
        const callback = function() {};
        const register = () => up.on('foo', callback);
        register();
        return expect(register).toThrowError(/cannot be registered more than once/i);
      });

      it('allows to register the same callback for different event names (bugfix)', function() {
        const callback = function() {};
        const register = function() {
          up.on('foo', callback);
          return up.on('bar', callback);
        };
        return expect(register).not.toThrowError();
      });

      it('allows to register the same callback for different elements (bugfix)', function() {
        const element1 = fixture('.element1');
        const element2 = fixture('.element2');
        const callback = function() {};
        const register = function() {
          up.on(element1, 'foo', callback);
          return up.on(element2, 'foo', callback);
        };
        return expect(register).not.toThrowError();
      });

      it('allows to register the same callback for different selectors (bugfix)', function() {
        const callback = function() {};
        const register = function() {
          up.on('foo', '.one', callback);
          return up.on('foo', '.two', callback);
        };
        return expect(register).not.toThrowError();
      });

      it('does not throw an error if a callback is registered, unregistered and registered a second time', function() {
        const callback = function() {};
        const register = () => up.on('foo', callback);
        const unregister = () => up.off('foo', callback);
        register();
        unregister();
        return expect(register).not.toThrowError();
      });

      return describe('passing of [up-data]', function() {

        it('parses an [up-data] attribute as JSON and passes the parsed object as a third argument to the listener', asyncSpec(function(next) {
          const observeArgs = jasmine.createSpy();
          up.on('click', '.child', (event, element, data) => observeArgs(element.className, data));

          const $child = $fixture(".child");
          const data = { key1: 'value1', key2: 'value2' };
          $child.attr('up-data', JSON.stringify(data));

          Trigger.click($child);

          return next(() => {
            return expect(observeArgs).toHaveBeenCalledWith('child', data);
          });
        })
        );

        it('passes an empty object as a second argument to the listener if there is no [up-data] attribute', asyncSpec(function(next) {
          const $child = $fixture('.child');
          const observeArgs = jasmine.createSpy();
          up.on('click', '.child', (event, element, data) => observeArgs(element.className, data));

          Trigger.click($('.child'));

          return next(() => {
            return expect(observeArgs).toHaveBeenCalledWith('child', {});
          });
        })
        );

        it('does not parse an [up-data] attribute if the listener function only takes one argument', asyncSpec(function(next) {
          const parseDataSpy = spyOn(up.syntax, 'data').and.returnValue({});

          const $child = $fixture('.child');
          up.on('click', '.child', function(event) {}); // no-op

          Trigger.click($child);

          return next(() => {
            return expect(parseDataSpy).not.toHaveBeenCalled();
          });
        })
        );

        return it('does not parse an [up-data] attribute if the listener function only takes two arguments', asyncSpec(function(next) {
          const parseDataSpy = spyOn(up.syntax, 'data').and.returnValue({});

          const $child = $fixture('.child');
          up.on('click', '.child', function(event, $element) {}); // no-op

          Trigger.click($child);

          return next(() => {
            return expect(parseDataSpy).not.toHaveBeenCalled();
          });
        })
        );
      });
    });

  //      it 'allows to bind and unbind events by their old, deprecated name', ->
  //        warnSpy = spyOn(up, 'warn')
  //        listener = jasmine.createSpy('listener')
  //
  //        # Reister listener for the old event name
  //        up.on('up:proxy:received', listener)
  //        expect(warnSpy).toHaveBeenCalled()
  //
  //        # Emit event with new name and see that it invokes the legacy listener
  //        up.emit('up:proxy:loaded')
  //        expect(listener.calls.count()).toBe(1)
  //
  //        # Check that up.off works with the old event name
  //        up.off('up:proxy:received', listener)
  //
  //        up.emit('up:proxy:loaded')
  //        expect(listener.calls.count()).toBe(1)


    describe('up.$on', () => it('registers a delagating event listener to the document body, which passes a jQuery-wrapped element as a second argument to the listener', asyncSpec(function(next) {
      fixture('.container[data-mark=container] .child[data-mark=child]');
      const observeClass = jasmine.createSpy();
      up.$on('click', '.child', (event, $element) => observeClass($element.attr('data-mark')));

      Trigger.click($('.container'));
      Trigger.click($('.child'));

      return next(() => {
        expect(observeClass).not.toHaveBeenCalledWith('container');
        return expect(observeClass).toHaveBeenCalledWith('child');
      });
    })
    ));


    describe('up.off', function() {

      it('unregisters an event listener previously registered through up.on', asyncSpec(function(next) {
        const $child = $fixture('.child');
        const clickSpy = jasmine.createSpy();
        up.on('click', '.child', clickSpy);
        Trigger.click($('.child'));
        up.off('click', '.child', clickSpy);
        Trigger.click($('.child'));

        return next(() => {
          return expect(clickSpy.calls.count()).toEqual(1);
        });
      })
      );

      it('allows to unregister a single event from a group of events that were registered in a single up.on call', asyncSpec(function(next) {
        const listener = jasmine.createSpy();
        const element = fixture('.element');
        up.on(element, 'mouseover mouseout', listener);

        up.off(element, 'mouseover', listener);
        Trigger.mouseover(element);

        next(function() {
          expect(listener.calls.count()).toBe(0);

          return Trigger.mouseout(element);
        });

        next(function() {
          expect(listener.calls.count()).toBe(1);

          up.off(element, 'mouseout', listener);

          return Trigger.mouseout(element);
        });

        return next(() => {
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );

      return it('allows to unregister a single element from a group of elements that were registered in a single up.on call', asyncSpec(function(next) {
        const listener = jasmine.createSpy();
        const element1 = fixture('.element1');
        const element2 = fixture('.element2');

        up.on([element1, element2], 'mouseover', listener);

        up.off(element1, 'mouseover', listener);
        Trigger.mouseover(element1);

        next(function() {
          expect(listener.calls.count()).toBe(0);

          return Trigger.mouseover(element2);
        });

        next(function() {
          expect(listener.calls.count()).toBe(1);

          up.off(element2, 'mouseover', listener);

          return Trigger.mouseover(element2);
        });

        return next(() => {
          return expect(listener.calls.count()).toBe(1);
        });
      })
      );
    });

  //      it 'throws an error if the given event listener was not registered through up.on', ->
  //        someFunction = ->
  //        offing = -> up.off 'click', '.child', someFunction
  //        expect(offing).toThrowError(/(not|never) registered/i)


    describe('up.$off', () => it('unregisters an event listener previously registered through up.$on', asyncSpec(function(next) {
      const $child = $fixture('.child');
      const clickSpy = jasmine.createSpy();
      up.$on('click', '.child', clickSpy);
      Trigger.click($('.child'));
      up.$off('click', '.child', clickSpy);
      Trigger.click($('.child'));

      return next(() => {
        return expect(clickSpy.calls.count()).toEqual(1);
      });
    })
    ));


    describe('up.emit', function() {

      it('triggers an event on the document', function() {
        let emittedEvent = undefined;
        let emittedTarget = undefined;

        up.on('foo', function(event, target) {
          emittedEvent = event;
          return emittedTarget = target;
        });

        expect(emittedEvent).toBeUndefined();
        expect(emittedTarget).toBeUndefined();

        up.emit('foo');

        expect(emittedEvent).toBeDefined();
        expect(emittedEvent.preventDefault).toBeDefined();
        return expect(emittedTarget).toEqual(document);
      });

      it('triggers an event that bubbles', function() {
        const $parent = $fixture('.parent');
        const $element = $parent.affix('.element');
        const callback = jasmine.createSpy('event handler');
        $parent[0].addEventListener('custom:name', callback);
        up.emit($element[0], 'custom:name');
        return expect(callback).toHaveBeenCalled();
      });

      it('triggers an event that can be stopped from propagating', function() {
        const $parent = $fixture('.parent');
        const $element = $parent.affix('.element');
        const callback = jasmine.createSpy('event handler');
        $parent[0].addEventListener('custom:name', callback);
        $element[0].addEventListener('custom:name', event => event.stopPropagation());
        up.emit($element[0], 'custom:name');
        return expect(callback).not.toHaveBeenCalled();
      });

      it('triggers an event that can have its default prevented (IE11 bugfix)', function() {
        const element = fixture('.element');
        element.addEventListener('custom:name', event => event.preventDefault());
        const event = up.emit(element, 'custom:name');
        return expect(event.defaultPrevented).toBe(true);
      });

      describe('custom event properties', () => it('accepts custom event properties that can be accessed from an up.on() handler', function() {
        let emittedEvent = undefined;
        up.on('foo', event => emittedEvent = event);

        up.emit('foo', { customField: 'custom-value' });

        return expect(emittedEvent.customField).toEqual('custom-value');
      }));

      it('accepts custom event properties that can be accessed from an jQuery.on() handler', function() {
        let emittedEvent = undefined;
        $(document).on('foo', event => emittedEvent = event.originalEvent);

        up.emit('foo', { customField: 'custom-value' });

        return expect(emittedEvent.customField).toEqual('custom-value');
      });

      it('accepts custom event properties that can be accessed from an addEventListener() handler', function() {
        let emittedEvent = undefined;
        document.addEventListener('foo', event => emittedEvent = event);

        up.emit('foo', { customField: 'custom-value' });

        return expect(emittedEvent.customField).toEqual('custom-value');
      });

      it('triggers an event on an element passed as { target } option', function() {
        let emittedEvent = undefined;
        let emittedElement = undefined;

        const element = fixture('.element');

        up.on('foo', function(event, element) {
          emittedEvent = event;
          return emittedElement = element;
        });

        up.emit('foo', {target: element});

        expect(emittedEvent).toBeDefined();
        expect(emittedElement).toEqual(element);

        return expect(emittedEvent.target).toEqual(element);
      });

      return it('triggers an event on an element passed as the first argument', function() {
        let emittedEvent = undefined;
        let emittedElement = undefined;

        const element = fixture('.element');

        up.on('foo', function(event, element) {
          emittedEvent = event;
          return emittedElement = element;
        });

        up.emit(element, 'foo');

        expect(emittedEvent).toBeDefined();
        expect(emittedElement).toEqual(element);

        return expect(emittedEvent.target).toEqual(element);
      });
    });

    describe('up.event.whenEmitted', function() {

      it('emits the event and fulfills the returned promise when no listener calls event.preventDefault()', function(done) {
        const eventListener = jasmine.createSpy('event listener');
        up.on('my:event', eventListener);
        const promise = up.event.whenEmitted('my:event', {key: 'value'});
        return promiseState(promise).then(function(result) {
          expect(eventListener).toHaveBeenCalledWith(jasmine.objectContaining({key: 'value'}), jasmine.anything(), jasmine.anything());
          expect(result.state).toEqual('fulfilled');
          return done();
        });
      });

      return it('emits the event and rejects the returned promise when any listener calls event.preventDefault()', function(done) {
        const eventListener = event => event.preventDefault();
        up.on('my:event', eventListener);
        const promise = up.event.whenEmitted('my:event', {key: 'value'});
        return promiseState(promise).then(function(result) {
          expect(result.state).toEqual('rejected');
          return done();
        });
      });
    });

    return describe('up.event.halt', function() {

      it('stops propagation of the given event to other event listeners on the same element', function() {
        const otherListenerBefore = jasmine.createSpy();
        const otherListenerAfter = jasmine.createSpy();
        const element = fixture('div');

        element.addEventListener('foo', otherListenerBefore);
        element.addEventListener('foo', up.event.halt);
        element.addEventListener('foo', otherListenerAfter);

        up.emit(element, 'foo');

        expect(otherListenerBefore).toHaveBeenCalled();
        return expect(otherListenerAfter).not.toHaveBeenCalled();
      });

      it('stops the event from bubbling up the document tree', function() {
        const parent = fixture('div');
        const element = e.affix(parent, 'div');
        const parentListener = jasmine.createSpy();
        parent.addEventListener('foo', parentListener);
        element.addEventListener('foo', up.event.halt);

        up.emit(element, 'foo');

        return expect(parentListener).not.toHaveBeenCalled();
      });

      return it('prevents default on the event', function() {
        const element = fixture('div');
        element.addEventListener('foo', up.event.halt);
        const event = up.emit(element, 'foo');
        return expect(event.defaultPrevented).toBe(true);
      });
    });
  }));
})();
