u = up.util

describe 'up.ExclusiveDynasty', ->

  describe '#claim', ->

    it 'calls the given animator function, which is expected to return a FinishablePromise', asyncSpec (next) ->
      finishablePromise = new up.FinishablePromise(u.unresolvablePromise(), u.noop)
      animator = jasmine.createSpy('animator').and.returnValue(finishablePromise)
      $element = affix('.element')
      dynasty = new up.ExclusiveDynasty('dynasty-name')
      dynasty.claim($element, animator)

      next =>
        expect(animator).toHaveBeenCalled()

    it "returns a promise that settles when the animator's return value settles", asyncSpec (next) ->
      observedPromise = u.newDeferred()
      finishablePromise = new up.FinishablePromise(observedPromise, u.noop)
      animator = jasmine.createSpy('animator').and.returnValue(finishablePromise)
      $element = affix('.element')
      dynasty = new up.ExclusiveDynasty('dynasty-name')
      claimDone = jasmine.createSpy('claimDone')
      dynasty.claim($element, animator).then(claimDone)

      next =>
        expect(claimDone).not.toHaveBeenCalled()

        observedPromise.resolve()

      next =>
        expect(claimDone).toHaveBeenCalled()

    describe 'managing of concurrent animations', ->

      beforeEach ->
        @animation1 = new up.FinishablePromise(u.unresolvablePromise(), u.noop)
        @animator1 = jasmine.createSpy('animator1').and.returnValue(@animation1)
        @animation2 = new up.FinishablePromise(u.unresolvablePromise(), u.noop)
        @animator2 = jasmine.createSpy('animator2').and.returnValue(@animation2)

      it "finishes a previous animation on the given element before calling the animator", asyncSpec (next) ->
        $element = affix('.element')
        dynasty = new up.ExclusiveDynasty('dynasty-name')

        dynasty.claim($element, @animator1)

        next =>
          expect(@animator1).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)

          dynasty.claim($element, @animator2)

        next =>
          expect(@animator2).toHaveBeenCalled()
          expect(@animation1.finished).toBe(true)
          expect(@animation2.finished).toBe(false)

      it "finishes a previous animation on a descendant of the given element", asyncSpec (next) ->
        $element = affix('.element')
        $child = $element.affix('.child')

        dynasty = new up.ExclusiveDynasty('dynasty-name')

        dynasty.claim($child, @animator1)

        next =>
          expect(@animator1).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)

          dynasty.claim($element, @animator2)

        next =>
          expect(@animator2).toHaveBeenCalled()
          expect(@animation1.finished).toBe(true)
          expect(@animation2.finished).toBe(false)

      it "finishes a previous animation on an ancestor of the given element", asyncSpec (next) ->
        $ancestor = affix('.ancestor')
        $element = $ancestor.affix('.element')

        dynasty = new up.ExclusiveDynasty('dynasty-name')

        dynasty.claim($ancestor, @animator1)

        next =>
          expect(@animator1).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)

          dynasty.claim($element, @animator2)

        next =>
          expect(@animator2).toHaveBeenCalled()
          expect(@animation1.finished).toBe(true)
          expect(@animation2.finished).toBe(false)

      it 'does not finish a previous animation if it is on another element', asyncSpec (next) ->
        $element1 = affix('.element1')
        $element2 = affix('.element2')
        dynasty = new up.ExclusiveDynasty('dynasty-name')

        dynasty.claim($element1, @animator1)

        next =>
          expect(@animator1).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)

          dynasty.claim($element2, @animator2)

        next =>
          expect(@animator2).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)
          expect(@animation2.finished).toBe(false)

      it 'does not finish a previous animation if it is on the same element, but in another ExclusiveDynasty', asyncSpec (next) ->
        $element = affix('.element')
        dynasty1 = new up.ExclusiveDynasty('dynasty1')
        dynasty2 = new up.ExclusiveDynasty('dynasty2')

        dynasty1.claim($element, @animator1)

        next =>
          expect(@animator1).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)

          dynasty2.claim($element, @animator2)

        next =>
          expect(@animator2).toHaveBeenCalled()
          expect(@animation1.finished).toBe(false)
          expect(@animation2.finished).toBe(false)
