window['Promise'] ||= class

  constructor: (executor) ->
    @deferred = $.Deferred()
    executor(@deferred.resolve, @deferred.reject)

  then: (fulfilled, rejected) =>
    @deferred.then(fulfilled, rejected)

  catch: (rejected) =>
    @then(undefined, rejected)

  @race: (promises) ->
    settled = false
    winner = $.Deferred()

    settle = (settler, value) ->
      unless settled
        settled = true
        winner[settler](value)
      undefined

    fulfilled = settle.apply(this, 'resolve')
    rejected = settle.apply(this, 'reject')

    for promise in promises
      promise.then(fulfilled, rejected)

    winner.promise()

  @all: (promises) ->
    $.when(promises...)

  @reject: (value) ->
    deferred = $.Deferred()
    deferred.reject(value)
    deferred.promise()

  @resolve: (value) ->
    deferred = $.Deferred()
    deferred.resolve(value)
    deferred.promise()
