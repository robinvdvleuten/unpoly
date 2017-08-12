u = up.util

#window.asyncSequence = (done, args...) ->
#  plan = args.pop()
#  options = args.pop() || {}
#
#  mockTime = u.option(options.mockTime, false)
#
#  if mockTime
#    mockClock = jasmine.clock()
#    mockClock.install()
#    mockClock.mockDate()
#
#  queue = []
#
#  dsl =
#    now: (block) ->
#      queue.push(['now', block])
#
#    after: (delay, block) ->
#      queue.push([delay, block])
#
#    next: (block) ->
#      # Delay by 1 instead of 0 so we are queued behind jQuery's
#      # internal setTimeout(0)
#      queue.push([0, block])
#
#  plan(dsl)
#
#  runBlockAndPoke = (block) ->
#    try
#      block()
#      pokeQueue()
#    catch e
#      done.fail(e)
#      throw e
#
#  pokeQueue = ->
#    if entry = queue.shift()
#      timing = entry[0]
#      block = entry[1]
#
#      console.debug('--- asyncSequence: %s / %o ---', timing, block)
#
#      switch timing
#        when 'now'
#          runBlockAndPoke(block)
#        else
#          fun = ->
#            # Move the block behind the microtask queue of that frame
#            Promise.resolve().then -> runBlockAndPoke(block)
#          setTimeout(fun, timing)
#
#          # Mocked time also freezes setTimeout
#          mockClock.tick(timing) if mockTime
#    else
#      done()
#
#  pokeQueue()


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
      queue.push([0, block])

    next.after = (delay, block) ->
      queue.push([delay, block])

    plan.call(this, next)

    runBlockAndPoke = (block) ->
      try
        block()
        pokeQueue()
      catch e
        done.fail(e)
        throw e

    pokeQueue = ->
      if entry = queue.shift()
        timing = entry[0]
        block = entry[1]

        console.debug('--- asyncSequence: %s / %o ---', timing, block)

        switch timing
          when 'now'
            runBlockAndPoke(block)
          else
            fun = ->
              # Move the block behind the microtask queue of that frame
              Promise.resolve().then -> runBlockAndPoke(block)
            setTimeout(fun, timing)

            # Mocked time also freezes setTimeout
            mockClock.tick(timing) if mockTime
      else
        done()

    pokeQueue()


window.asyncIt = (description, args...) ->
  it description, asyncSpec(args...)
