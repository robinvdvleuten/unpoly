u = up.util

describe 'up.FinishablePromise', ->

  describe '#then', ->

    it 'registers a callback that will be called when the observed promise is fulfilled', asyncSpec (next) ->
      observedPromise = u.newDeferred()
      finishablePromise = new up.FinishablePromise(observedPromise, u.noop)
      onFulfilled = jasmine.createSpy('onFulfilled')
      onRejected = jasmine.createSpy('onRejected')
      finishablePromise.then(onFulfilled, onRejected)

      next =>
        expect(onFulfilled).not.toHaveBeenCalled()
        expect(onRejected).not.toHaveBeenCalled()

        observedPromise.resolve('value')

      next =>
        expect(onFulfilled).toHaveBeenCalledWith('value')
        expect(onRejected).not.toHaveBeenCalled()

    it 'registers a callback that will be called when the observed promise is rejected', asyncSpec (next) ->
      observedPromise = u.newDeferred()
      finishablePromise = new up.FinishablePromise(observedPromise, u.noop)
      onFulfilled = jasmine.createSpy('onFulfilled')
      onRejected = jasmine.createSpy('onRejected')
      finishablePromise.then(onFulfilled, onRejected)

      next =>
        expect(onFulfilled).not.toHaveBeenCalled()
        expect(onRejected).not.toHaveBeenCalled()

        observedPromise.reject('reason')

      next =>
        expect(onFulfilled).not.toHaveBeenCalled()
        expect(onRejected).toHaveBeenCalledWith('reason')

  describe '#finish', ->

    it 'calls the finish function and resolves the FinishablePromise', asyncSpec (next) ->
      finisher = jasmine.createSpy('finisher')
      observedPromise = u.newDeferred()
      finishablePromise = new up.FinishablePromise(observedPromise, finisher)
      onFulfilled = jasmine.createSpy('onFulfilled')
      finishablePromise.then(onFulfilled)

      next =>
        expect(finisher).not.toHaveBeenCalled()
        expect(onFulfilled).not.toHaveBeenCalled()

        finishablePromise.finish()

      next =>
        expect(finisher).toHaveBeenCalled()
        expect(onFulfilled).toHaveBeenCalled()

    it "doesn't call the finish function multiple times", asyncSpec (next) ->
      finisher = jasmine.createSpy('finisher')
      observedPromise = u.newDeferred()
      finishablePromise = new up.FinishablePromise(observedPromise, finisher)
      onFulfilled = jasmine.createSpy('onFulfilled')
      finishablePromise.then(onFulfilled)

      next =>
        # Two calls in the same microtask
        finishablePromise.finish()
        finishablePromise.finish()

      next =>
        # A third call in another microtask
        finishablePromise.finish()

      next =>
        expect(finisher.calls.count()).toBe(1)

    it "doesn't call the finish function if the observed promise has already settled", asyncSpec (next) ->
      finisher = jasmine.createSpy('finisher')
      fulfilledPromise = Promise.resolve()
      finishablePromise = new up.FinishablePromise(fulfilledPromise, finisher)

      next =>
        finishablePromise.finish()

      next =>
        expect(finisher).not.toHaveBeenCalled()
