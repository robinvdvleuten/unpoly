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

    queuePointer = 0

    insertAtCursor = (task) ->
      # We insert at pointer instead of pushing to the end.
      # This way tasks can insert additional tasks at runtime.
      queue.splice(queuePointer, 0, task)
      queuePointer++

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

    runBlockAsyncThenPoke = (block) ->
      console.debug('[asyncSequence] runBlockAsync')
      promise = block()
      promise.then => pokeQueue()
      promise.catch (e) => done.fail(e)

    pokeQueue = ->
      if entry = queue[queuePointer]
        queuePointer++

        timing = entry[0]
        block = entry[1]
        callStyle = entry[2]

        console.debug('[asyncSequence] %s / %o / %s ---', timing, block, callStyle)

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

    queuePointer = 0
    pokeQueue()
