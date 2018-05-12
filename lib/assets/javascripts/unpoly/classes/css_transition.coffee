u = up.util

class up.CssTransition

  constructor: ($element, lastFrame, options) ->
    console.debug("new CssTransition for %o, %o", $element, lastFrame)
    @$element = $element
    @element = u.element($element)
    @lastFrameCamel = u.camelCaseKeys(lastFrame)
    @lastFrameKebab = u.kebabCaseKeys(lastFrame)
    @lastFrameKeysKebab = Object.keys(@lastFrameKebab)
    @finishEvent = options.finishEvent
    @duration = options.duration
    @delay = options.delay
    @totalDuration = @delay + @duration
    @easing = options.easing

  start: =>
    if @lastFrameKeysKebab.length == 0
      # If we have nothing to animate, we will never get a transitionEnd event
      # and the returned promise will never resolve.
      return Promise.resolve()

    @deferred = u.newDeferred()
    @pauseOldTransition()
    @startTime = new Date()
    @startFallbackTimer()
    @listenToFinishEvent()
    @listenToTransitionEnd()

    @startMotion()

    return @deferred.promise()

  listenToFinishEvent: =>
    if @finishEvent
      @$element.on(@finishEvent, @onFinishEvent)

  stopListenToFinishEvent: =>
    if @finishEvent
      @$element.off(@finishEvent, @onFinishEvent)

  onFinishEvent: (event) =>
    # don't waste time letting the event bubble up the DOM
    event.stopPropagation()
    @finish()

  startFallbackTimer: =>
    timingTolerance = 100
    console.debug("will call fallbacktimer after %d", (@totalDuration + timingTolerance))
    @fallbackTimer = u.setTimer (@totalDuration + timingTolerance), =>
      console.debug("~~~ finishing animation because fallbacktimer after ", (new Date() - @startTime))
      @finish()

  stopFallbackTimer: =>
    clearTimeout(@fallbackTimer)

  listenToTransitionEnd: =>
    @$element.on 'transitionend', @onTransitionEnd

  stopListenToTransitionEnd: =>
    @$element.off 'transitionend', @onTransitionEnd

  onTransitionEnd: (event) =>
    # Check if the transitionend event was caused by our own transition,
    # and not by some other transition that happens to affect this element.
    return unless event.target == @element

    # Check if we are receiving a late transitionEnd event
    # from a previous CSS transition.
    elapsed = new Date() - @startTime
    return end unless elapsed > 0.3 * @totalDuration

    completedPropertyKebab = event.originalEvent.propertyName
    return unless u.contains(@lastFrameKeysKebab, completedPropertyKebab)

    console.debug("~~~ finishing animation because transitionEnd on ", @element, event.originalEvent.propertyName, elapsed)

    @finish()

  finish: =>
    @stopFallbackTimer()
    @stopListenToFinishEvent()
    @stopListenToTransitionEnd()

    # Cleanly finish our own transition so the old transition
    # (or any other transition set right after that) will be able to take effect.
    u.finishCssTransition(@element)

    @resumeOldTransition?()

    @deferred.resolve()

  pauseOldTransition: =>
    console.debug("pauseOld with %o", @element)

    @oldTransition = u.readComputedStyle(@element, [
      'transitionProperty',
      'transitionDuration',
      'transitionDelay',
      'transitionTimingFunction'
    ])

    @hasOldTransition = u.hasCssTransition(@oldTransition)

    if @hasOldTransition
      # Freeze the previous transition at its current place, by setting the
      # currently computed, animated CSS properties as inline styles
      # We don't want to freeze all properties, so we don't support that case.
      unless @oldTransition.transitionProperty == 'all'
        oldTransitionFrameKeys = @oldTransition.transitionProperty.split(/\s*,\s*/)
        oldTransitionCurrentFrameKebab = u.readComputedStyle(@element, oldTransitionFrameKeys)
        oldTransitionCurrentFrameCamel = u.camelCaseKeys(oldTransitionCurrentFrameKebab)
        @unfreezeOldTransitionCurrentFrame = u.writeTemporaryStyle(@element, oldTransitionCurrentFrameCamel)

      # Stop the existing CSS transition so it does not emit transitionEnd events
      @setOldTransition = u.finishCssTransition(@element)

  resumeOldTransition: =>
    if @hasOldTransition
      @unfreezeOldTransitionCurrentFrame?()
      @setOldTransition()

  startMotion: =>
    styles =
      transitionProperty: Object.keys(@lastFrameKebab).join(', ')
      transitionDuration: "#{@duration}ms"
      transitionDelay: "#{@delay}ms"
      transitionTimingFunction: @easing

    console.log("styles are", styles)

    u.assign(styles, @lastFrameCamel)

    u.writeInlineStyle(@element, styles)

