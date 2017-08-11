u = up.util

#window.asyncSequence = (done, options = {}) ->
#  mockTime = u.option(options.mockTime, false)
#
#  sequence = []
#
#  if mockTime
#    mockClock = jasmine.clock()
#    mockClock.install()
#    mockClock.mockDate()
#
#  runBlock = (block) ->
#    try
#      block()
#    catch e
#      done.fail(e)
#      throw e
#
#  next = (block) ->
#    after(0, block)
#
#  after = (delay, block) ->
#    u.setTimer delay, -> runBlock(block)
#    mockClock.tick(delay) if mockTime
#    this
#
#  first = (block) ->
#    runBlock(block)
#    this
#
#  last = (block) ->
#    next ->
#      runBlock(block)
#      done()
#
#  { first, next, after, last }

window.asyncSequence = (done, args...) ->
  plan = args.pop()
  options = args.pop() || {}

  mockTime = u.option(options.mockTime, false)

  if mockTime
    mockClock = jasmine.clock()
    mockClock.install()
    mockClock.mockDate()

  queue = []

  dsl =
    now: (block) ->
      queue.push(['sync', block])

    after: (delay, block) ->
      queue.push([delay, block])

    next: (block) ->
      queue.push([0, block])

  plan(dsl)

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

      if timing == 'sync'
        runBlockAndPoke(block)
      else
        u.setTimer timing, ->
          Promise.resolve().then ->
            runBlockAndPoke(block)
        # Mocked time also freezes setTimeout
        mockClock.tick(timing) if mockTime
    else
      done()

  pokeQueue()
