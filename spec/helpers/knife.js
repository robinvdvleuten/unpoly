/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//#
// Knife: Get, set or mock inaccessible variables in a JavaScript closure
// ======================================================================
//
// Requires [Jasmine](http://jasmine.github.io/) 2+.
//
// Usage:
//
//     klass = (->
//
//       privateVariable = 0
//
//       privateMethod = ->
//         privateVariable += 1
//
//       publicMethod = ->
//         privateMethod()
//
//       add: add
//       knife: eval(Knife.point)
//
//     )()
//
//     klass.knife.get('privateVariable') => 0
//     klass.knife.set('privateCounter', 5)
//     klass.knife.get('privateCounter') => 5
//     spy = klass.knife.mock('privateMethod').and.returnValue("mocked!")
//     klass.publicMethod() # => 'mocked!'
//     expect(spy).toHaveBeenCalled()
//
window.Knife = (function() {

  const contextBleeder = function() {

    const get = symbol => eval(symbol);

    const set = (symbol, value) => eval(`${symbol} = value`);

    const mock = function(symbol) {
      const oldImpl = get(symbol);
      const spy = jasmine.createSpy(symbol, oldImpl);
      set(symbol, spy);
      const cleaner = () => set(symbol, oldImpl);
      Knife.cleaners.push(cleaner);
      return spy;
    };

    return {
      get,
      set,
      mock
    };
  };

  const reset = () => (() => {
    let cleaner;
    const result = [];
    while ((cleaner = Knife.cleaners.pop())) {
      result.push(cleaner());
    }
    return result;
  })();

  const me = {};
  me.reset = reset;
  me.cleaners = [];

  if (typeof jasmine !== 'undefined' && jasmine !== null) {
    me.point = `(${contextBleeder.toString()})()`;
    // Jasmine defines afterEach on window
    afterEach(reset);
  } else {
    me.point = "undefined";
  }

  return me;

})();
