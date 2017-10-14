u = up.util

###*
@class up.FinishablePromise
###
class up.FinishablePromise

  ###*
  @constructor
  @param {Promise} observedPromise
  @param {Function} finishObservedPromise
  ###
  constructor: (@observedPromise, @finishObservedPromise) ->
    @finished = false
    @apiPromise = u.newDeferred()
    u.always @observedPromise, => @finished = true
    @observedPromise.then(@apiPromise.resolve, @apiPromise.reject)

  ###*
  @method then
  @param {Function} [onFulfilled]
  @param {Function} [onRejected]
  @return {Promise}
  ###
  then: (onFulfilled, onRejected) =>
    @apiPromise.then(onFulfilled, onRejected)

  ###
  @method finish
  @return {Promise}
    A promise that will be fulfilled once this promise was finished.
  ###
  finish: =>
    # Don't call @finishObservedPromise if @observedPromise has already settled.
    unless @finished
      @finished = true # Prevent multiple calls in this microtask
      @finishObservedPromise()
      @apiPromise.resolve()
    this

  ###*
  Returns a `FinishablePromise` that is already resolved.

  @function resolve
  @param {any} [value]
    The resolution value.
  @return {FinishablePromise}
  ###
  @resolve: (value) ->
    new @(Promise.resolve(value), u.noop)

  ###*
  Returns a `FinishablePromise` that is already rejected.

  @function reject
  @param {any} [reason]
    The rejection reason.
  @return {FinishablePromise}
  ###
  @reject: (value) ->
    new @(Promise.reject(value), u.noop)

  ###*
  Returns a new `FinishablePromise` that resolves once all given `FinishablePromises` have resolved.

  @function all
  @param {Array<FinishablePromise>} finishablePromises
  @return {FinishablePromise}
    A `FinishablePromise` that will be settled when all the given promises are settled.
  ###
  @all: (finishablePromises) ->
    allDone = Promise.all(finishablePromises)
    finishAll = u.sequence(u.map(finishablePromises, (p) -> p.finish))
    new @(allDone, finishAll)

  @quacks: (object) ->
    u.isPromise(object) && object.finish
