/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
(function () {
  const u = up.util;
  const $ = jQuery;

  const LOG_ENABLED = false;

  const unstubbedSetTimeout = window.setTimeout;

  window.asyncSpec = (...args) => (function(originalDone) {

    const done = function() {
      // For some reason Jasmine ignores done() calls if its own clock is stubbed
      jasmine.clock().uninstall();
      return originalDone();
    };

    const fail = function(...args) {
      // For some reason Jasmine ignores done() calls if its own clock is stubbed
      jasmine.clock().uninstall();
      return originalDone.fail(...Array.from(args || []));
    };

    const plan = args.pop();

    const queue = [];

    let insertCursor = 0;

    const log = function(...args) {
      if (LOG_ENABLED) {
        args[0] = `[asyncSpec] ${args[0]}`;
        return up.log.debug(...Array.from(args || []));
      }
    };

    const insertAtCursor = function(task) {
      log('Inserting task at index %d: %o', insertCursor, task);
      // We insert at pointer instead of pushing to the end.
      // This way tasks can insert additional tasks at runtime.
      queue.splice(insertCursor, 0, task);
      return insertCursor++;
    };

    const next = block => insertAtCursor([0, block, 'sync']);

    next.next = next; // alternative API

    next.after = (delay, block) => insertAtCursor([delay, block, 'sync']);

    next.await = block => insertAtCursor([0, block, 'async']);

    next.fail = fail;

    // Call example body
    plan.call(this, next);

    const runBlockSyncAndPoke = function(block) {
      try {
        log('runBlockSync');
        block();
        return pokeQueue();
      } catch (e) {
        fail(e);
        throw e;
      }
    };

    const runBlockAsyncThenPoke = function(blockOrPromise) {
      log('runBlockAsync');
      // On plan-level people will usually pass a function returning a promise.
      // During runtime people will usually pass a promise to delay the next step.
      const promise = u.isPromise(blockOrPromise) ? blockOrPromise : blockOrPromise();
      promise.then(() => pokeQueue());
      return promise.catch(e => fail(e));
    };

    var pokeQueue = function() {
      let entry;
      if (entry = queue[runtimeCursor]) {
        log('Playing task at index %d', runtimeCursor);
        runtimeCursor++;
        insertCursor++;

        const timing = entry[0];
        const block = entry[1];
        const callStyle = entry[2];

        log('Task is %s after %d ms: %o', callStyle, timing, block);

        switch (timing) {
          case 'now':
            return runBlockSyncAndPoke(block);
          default:
            var fun = () => // Move the block behind the microtask queue of that frame
            Promise.resolve().then(function() {
              if (callStyle === 'sync') {
                return runBlockSyncAndPoke(block);
              } else { // async
                return runBlockAsyncThenPoke(block);
              }
            });

            // Also move to the next frame
            return unstubbedSetTimeout(fun, timing);
        }
      } else {
        log('calling done()');
        return done();
      }
    };

    var runtimeCursor = (insertCursor = 0);
    return pokeQueue();
  });
})();