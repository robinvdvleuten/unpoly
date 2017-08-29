u = up.util

window.asyncSpec = (args...) ->
  (done) ->

    plan = args.pop()
    options = args.pop() || {}

    mockTime = u.option(options.mockTime, false)

    if mockTime
      mockClock = jasmine.clock()
      mockClock.install()
      mockClock.mockDate()

    queue = []

    insertCursor = 0

    insertAtCursor = (task) ->
      console.debug('[asyncSequence] Inserting task at index %d: %o', insertCursor, task)
      # We insert at pointer instead of pushing to the end.
      # This way tasks can insert additional tasks at runtime.
      queue.splice(insertCursor, 0, task)
      insertCursor++

    next = (block) ->
      insertAtCursor [0, block, 'sync']

    next.next = next # alternative API

    next.after = (delay, block) ->
      insertAtCursor [delay, block, 'sync']

    next.await = (block) ->
      insertAtCursor  [0, block, 'async']

    # Call example body
    plan.call(this, next)

    runBlockSyncAndPoke = (block) ->
      try
        console.debug('[asyncSequence] runBlockSync')
        block()
        pokeQueue()
      catch e
        done.fail(e)
        throw e

    runBlockAsyncThenPoke = (blockOrPromise) ->
      console.debug('[asyncSequence] runBlockAsync')
      # On plan-level people will usually pass a function returning a promise.
      # During runtime people will usually pass a promise to delay the next step.
      promise = if u.isPromise(blockOrPromise) then blockOrPromise else blockOrPromise()
      promise.then => pokeQueue()
      promise.catch (e) => done.fail(e)

    pokeQueue = ->
      if entry = queue[runtimeCursor]
        console.debug('[asyncSequence] Playing task at index %d', runtimeCursor)
        runtimeCursor++
        insertCursor++

        timing = entry[0]
        block = entry[1]
        callStyle = entry[2]

        console.debug('[asyncSequence] Task is %s after %d ms: %o', callStyle, timing, block)

        switch timing
          when 'now'
            runBlockSyncAndPoke(block)
          else
            fun = ->
              # Move the block behind the microtask queue of that frame
              Promise.resolve().then ->
                if callStyle == 'sync'
                  runBlockSyncAndPoke(block)
                else
                  runBlockAsyncThenPoke(block)

            # Also move to the next frame
            console.debug('[asyncSequence] setting timeout in %d (mockTime: %o)', timing, mockTime)
            setTimeout(fun, timing)

            # Mocked time also freezes setTimeout
            mockClock.tick(timing) if mockTime
      else
        console.debug('[asyncSequence] calling done()')
        done()

    runtimeCursor = insertCursor = 0
    pokeQueue()
