#= require ./base

e = up.element
u = up.util

###**
Base class for all non-root layer modes

@class up.Layer.Overlay
###
class up.Layer.Overlay extends up.Layer

  keys: ->
    super.concat [
      'position',
      'align',
      'size',
      'origin', # for tethered anchor element
      'class',
      'openAnimation',
      'closeAnimation',
      'openDuration',
      'closeDuration',
      'openEasing',
      'closeEasing',
      'backdropOpenAnimation',
      'backdropCloseAnimation',
      'buttonDismissable',
      'escapeDismissable',
      'backdropDismissable',
      'dismissLabel',
      'dismissAriaLabel',
      'onOpening',
      'onOpened',
      'onAccept',
      'onAccepting',
      'onAccepted',
      'onDismiss',
      'onDismissing',
      'onDismissed',
      'onContentAttached',
    ]

  # TODO: Rename openNow to something that doesn't have the sync/async connotation
  ###**
  @function up.Layer.Overlay#openNow
  @param {Element} options.parent
  @param {Element} options.content
  @param {string|Object|Function(element, options): Promise} [options.animation]
  @param {string|Object|Function(element, options): Promise} [options.backdropAnimation]
  @param {string} [options.easing]
  @param {number} [options.duration]
  @param {number} [options.delay]
  ###
  openNow: (options) ->
    throw up.error.notImplemented()

  # TODO: Rename closeNow to something that doesn't have the sync/async connotation
  ###**
  @function up.Layer.Overlay#closeNow
  @param {string|Object|Function(element, options): Promise} [options.animation]
  @param {string|Object|Function(element, options): Promise} [options.backdropAnimation]
  @param {string} [options.easing]
  @param {number} [options.duration]
  @param {number} [options.delay]
  ###
  closeNow: (options) ->
    throw up.error.notImplemented()

  createElement: (parentElement = @stack.overlayContainer) ->
    attrs = u.compactObject
      'up-mode': @constructor.mode
      'up-align': @align
      'up-position': @position,
      'up-size': @size,
    @element = @affix(parentElement, null, attrs)

    if @class
      @element.classList.add(@class)

    if @backdropDismissable
      @element.addEventListener 'click', (event) =>
        unless e.closest(event.target, @selector('frame'))
          u.muteRejection @dismiss()
          up.event.halt(event)

    @registerCloser(@acceptOn, @accept)
    @registerCloser(@dismissOn, @dismiss)

  affix: (parent, part, attrs) ->
    return e.affix(parent, @selector(part), attrs)

  selector: (part) ->
    u.compact(['.up', @constructor.mode, part]).join('-')

  registerCloser: (closer, close) ->
    if closer
      [eventName, selector] = closer.match(/^([^ ]+)(?: (.*))?$/)
      @on(@eventName, selector, close.bind(this))

  destroyElement: (options) ->
    up.destroy(@element, options)

  createDismissElement: (parentElement) ->
    if @buttonDismissable
      @dismissElement = @affix(parentElement, 'dismiss',
        'up-dismiss': '',
        'aria-label': @dismissAriaLabel
      )
      # Since the dismiss button already has an accessible [aria-label]
      # we hide the "X" label from screen readers.
      e.affix(@dismissElement, 'span[aria-hidden="true"]', text: @dismissLabel)

  frameInnerContent: (parentElement, options) ->
    content = options.content
    @frameElement = @affix(parentElement, 'frame')
    @contentElement = @affix(@frameElement, 'content')
    @contentElement.appendChild(content)
    @createDismissElement(@frameElement)
    options.onContentAttached?({ layer: this, content })

  openAnimateOptions: ->
    easing: @openEasing
    duration: @openDuration

  closeAnimateOptions: ->
    easing: @closeEasing
    duration: @closeDuration

  contains: (element) ->
    # Test that the closest parent is the element and not another layer.
    e.closest(element, @selector()) == @element

  allElements: (selector) ->
    e.all(@contentElement, selector)

  accept: (value, options = {}) ->
    new up.Change.AcceptLayer(u.merge(options, { value: value, layer: this })).executeAsync()

  dismiss: (value, options = {}) ->
    new up.Change.DismissLayer(u.merge(options, { value: value, layer: this })).executeAsync()
