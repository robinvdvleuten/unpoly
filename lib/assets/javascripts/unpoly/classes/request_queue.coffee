u = up.util

class up.RequestQueue extends up.Class

  constructor: (options = {}) ->
    @concurrency = options.concurrency ? 1
    @reset()

  reset: ->
    @queuedRequests = []
    @currentRequests = []

  @getter 'allRequests', ->
    @currentRequests.concat(@queuedRequests)

  asap: (request) ->
    console.debug("asap(%o) with concurency %o and active count %o", request.uid, @concurrency, @currentRequests.length)

    if @hasConcurrencyLeft()
      @runRequestNow(request)
    else
      @queueRequest(request)

    return request

  hasConcurrencyLeft: ->
    concurrency = u.evalOption(@concurrency) ? 1
    return concurrency == -1 || @currentRequests.length < concurrency

  isBusy: ->
    @currentRequests.length > 0

  poke: =>
    if request = @queuedRequests.shift()
      @runRequestNow(request)

  queueRequest: (request) ->
    console.debug("queueRequest(%o)", request.uid)
    @queuedRequests.push(request)

  pluckNextRequest: ->
    @queuedRequests.shift()

  runRequestNow: (request) ->
    console.debug("runRequestNow(%o)", request.uid)
    @currentRequests.push(request)

    console.debug("active request count is now", @currentRequests.length)

    returnValue = request.start()

    console.debug("return value of request %o is %o", request.uid, returnValue)

    if u.isPromise(returnValue)
      u.always(returnValue, => @onRequestDone(request))
    else
      @onRequestDone(request)

  onRequestDone: (request) ->
    console.debug("onRequestDone(%o)", request.uid)
    u.remove(@currentRequests, request)
    u.microtask(@poke)

  poke: ->
    if @hasConcurrencyLeft() && (request = @pluckNextRequest())
      @runRequestNow(request)

  abortList: (list, conditions) ->
    copy = u.copy(list)

    copy.forEach (request) ->
      if @requestMatches(request, conditions)
        request.abort()
        # Although the request will eventually remove itself from the queue,
        # we want to keep our sync signature and adjust the list sync.
        u.remove(list, request)

    return

  requestMatches: (request, conditions) ->
    conditions == true || request == conditions || u.objectContains(request, conditions)

  abort: (conditions = true) ->
    console.debug("abort(%o)", conditions)
    @abortList(@currentRequests, conditions)
    @abortList(@queuedRequests, conditions)
