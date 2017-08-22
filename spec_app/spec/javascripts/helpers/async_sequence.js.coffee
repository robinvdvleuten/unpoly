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

    next = (block) ->
      queue.push([0, block, 'sync'])

    next.next = next

    next.after = (delay, block) ->
      queue.push([delay, block, 'sync'])

    next.await = (block) ->
      queue.push([0, block, 'async'])

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
      if entry = queue.shift()
        timing = entry[0]
        block = entry[1]
        kind = entry[2]

        console.debug('[asyncSequence] %s / %o / %s ---', timing, block, kind)

        switch timing
          when 'now'
            runBlockSyncAndPoke(block)
          else
            fun = ->
              # Move the block behind the microtask queue of that frame
              Promise.resolve().then ->
                if kind == 'sync'
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

    pokeQueue()


window.asyncIt = (description, args...) ->
  it description, asyncSpec(args...)
