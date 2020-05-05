/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function() {
  const u = up.util;
  const $ = jQuery;

  describe('up.log', () => describe('JavaScript functions', function() {

    describe('up.log.puts', () => it('sends a log message to the developer console iff the log is enabled', function() {
      spyOn(console, 'log');

      up.log.disable();
      up.log.puts('message');
      expect(console.log).not.toHaveBeenCalled();

      up.log.enable();
      up.log.puts('message');
      return expect(console.log).toHaveBeenCalledWith('[UP] message');
    }));

    describe('up.log.debug', () => it('sends a debug message to the developer console iff the log is enabled', function() {
      spyOn(console, 'debug');

      up.log.disable();
      up.log.debug('message');
      expect(console.debug).not.toHaveBeenCalled();

      up.log.enable();
      up.log.debug('message');
      return expect(console.debug).toHaveBeenCalledWith('[UP] message');
    }));

    describe('up.log.error', () => it('sends an error message to the developer console regardless whether the log is enabled or not', function() {
      spyOn(console, 'error');

      up.log.disable();
      up.log.error('message1');
      expect(console.error).toHaveBeenCalledWith('[UP] message1');

      up.log.enable();
      up.log.error('message2');
      return expect(console.error.calls.allArgs()).toEqual([
        ['[UP] message1'],
        ['[UP] message2']
      ]);
  }));

    return describe('up.log.sprintf', function() {

      describe('with string argument', () => it('serializes with surrounding quotes', function() {
        const formatted = up.log.sprintf('before %o after', 'argument');
        return expect(formatted).toEqual('before "argument" after');
      }));

      describe('with undefined argument', () => it('serializes to the word "undefined"', function() {
        const formatted = up.log.sprintf('before %o after', undefined);
        return expect(formatted).toEqual('before undefined after');
      }));

      describe('with null argument', () => it('serializes to the word "null"', function() {
        const formatted = up.log.sprintf('before %o after', null);
        return expect(formatted).toEqual('before null after');
      }));

      describe('with number argument', () => it('serializes the number as string', function() {
        const formatted = up.log.sprintf('before %o after', 5);
        return expect(formatted).toEqual('before 5 after');
      }));

      describe('with function argument', () => it('serializes the function code', function() {
        const formatted = up.log.sprintf('before %o after', function foo() {});
        return expect(formatted).toEqual('before function foo() {} after');
      }));

      describe('with array argument', () => it('recursively serializes the elements', function() {
        const formatted = up.log.sprintf('before %o after', [1, "foo"]);
        return expect(formatted).toEqual('before [1, "foo"] after');
      }));

      describe('with element argument', () => it('serializes the tag name with id, name and class attributes, but ignores other attributes', function() {
        const $element = $('<table id="id-value" name="name-value" class="class-value" title="title-value">');
        const element = $element.get(0);
        const formatted = up.log.sprintf('before %o after', element);
        return expect(formatted).toEqual('before <table id="id-value" name="name-value" class="class-value"> after');
      }));

      describe('with jQuery argument', () => it('serializes the tag name with id, name and class attributes, but ignores other attributes', function() {
        const $element1 = $('<table id="table-id">');
        const $element2 = $('<ul id="ul-id">');
        const formatted = up.log.sprintf('before %o after', $element1.add($element2));
        return expect(formatted).toEqual('before $(<table id="table-id">, <ul id="ul-id">) after');
      }));

      return describe('with object argument', function() {

        it('serializes to JSON', function() {
          const object = { foo: 'foo-value', bar: 'bar-value' };
          const formatted = up.log.sprintf('before %o after', object);
          return expect(formatted).toEqual('before {"foo":"foo-value","bar":"bar-value"} after');
        });

        return it("skips a key if a getter crashes", function() {
          const object = {};
          Object.defineProperty(object, 'foo', {get() { throw "error"; }});
          let formatted = up.log.sprintf('before %o after', object);
          expect(formatted).toEqual('before {} after');

          object.bar = 'bar';
          formatted = up.log.sprintf('before %o after', object);
          return expect(formatted).toEqual('before {"bar":"bar"} after');
        });
      });
    });
  }));
})();