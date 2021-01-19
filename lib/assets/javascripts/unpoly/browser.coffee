###**
Browser support
===============

Unpoly supports all modern browsers.

Chrome, Firefox, Edge, Safari
: Full support

Internet Explorer 11
: Full support with a `Promise` polyfill like [es6-promise](https://github.com/stefanpenner/es6-promise) (2.4 KB).

Internet Explorer 10 or lower
: Unpoly prevents itself from booting itself, leaving you with a classic server-side application.

@module up.browser
###
up.browser = do ->

  u = up.util

  ###**
  Makes a full page request, replacing the entire JavaScript environment with a new page from the server response.

  @function up.browser.loadPage
  @param {string} options.url
    The URL to load.
  @param {string} [options.method='get']
    The method for the request.

    Methods other than GET or POST will be [wrapped](/up.protocol.config#config.methodParam) in a POST request.
  @param {Object|Array|FormData|string} [options.params]
  @external
  ###
  loadPage = (requestsAttrs) ->
    new up.Request(requestsAttrs).loadPage()

  ###**
  Submits the given form with a full page load.
  
  For mocking in specs.

  @function up.browser.submitForm
  @internal
  ###
  submitForm = (form) ->
    form.submit()

  isIE11 = u.memoize ->
    'ActiveXObject' of window # this is undefined, but the key is set

  ###**
  Returns whether this browser supports manipulation of the current URL
  via [`history.pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState).

  When `pushState`  (e.g. through [`up.follow()`](/up.follow)), it will gracefully
  fall back to a full page load.

  Note that Unpoly will not use `pushState` if the initial page was loaded with
  a request method other than GET.

  @function up.browser.canPushState
  @return {boolean}
  @internal
  ###
  canPushState = ->
    # We cannot use pushState if the initial request method is a POST for two reasons:
    #
    # 1. Unpoly replaces the initial state so it can handle the pop event when the
    #    user goes back to the initial URL later. If the initial request was a POST,
    #    Unpoly will wrongly assumed that it can restore the state by reloading with GET.
    #
    # 2. Some browsers have a bug where the initial request method is used for all
    #    subsequently pushed states. That means if the user reloads the page on a later
    #    GET state, the browser will wrongly attempt a POST request.
    #    This issue affects Safari 9 and 10 (last tested in 2017-08).
    #    Modern Firefoxes, Chromes and IE10+ don't have this behavior.
    #
    # The way that we work around this is that we don't support pushState if the
    # initial request method was anything other than GET (but allow the rest of the
    # Unpoly framework to work). This way Unpoly will fall back to full page loads until
    # the framework was booted from a GET request.
    history.pushState && up.protocol.initialRequestMethod() == 'GET'

  ###**
  Returns whether this browser supports promises.

  @function up.browser.canPromise
  @return {boolean}
  @internal
  ###
  canPromise = u.memoize ->
    !!window.Promise

  canFormatLog = u.memoize ->
    !isIE11()

  canPassiveEventListener = u.memoize ->
    !isIE11()

  # Don't memoize so a build may publish window.jQuery after Unpoly was loaded
  canJQuery = ->
    !!window.jQuery

  popCookie = (name) ->
    if value = document.cookie.match(new RegExp(name+"=(\\w+)"))?[1]
      document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT; path=/'
    value

  ###**
  @function up,browser.whenConfirmed
  @return {Promise}
  @param {string} options.confirm
  @param {boolean} options.preload
  @internal
  ###
  whenConfirmed = (options) ->
    if !options.confirm || window.confirm(options.confirm)
      return Promise.resolve()
    else
      return up.error.aborted.async('User canceled action')

  ###**
  Returns whether Unpoly supports the current browser.

  If this returns `false` Unpoly will prevent itself from [booting](/up.boot)
  and ignores all registered [event handlers](/up.on) and [compilers](/up.compiler).
  This leaves you with a classic server-side application.
  This is usually a better fallback than loading incompatible Javascript and causing
  many errors on load.

  @function up.browser.isSupported
  @stable
  ###
  isSupported = ->
    return canPushState() && canPromise()

  callJQuery = (args...) ->
    canJQuery() or up.fail("jQuery must be published as window.jQuery")
    return jQuery(args...)

  u.literal
    loadPage: loadPage
    submitForm: submitForm
    canFormatLog: canFormatLog
    canPassiveEventListener: canPassiveEventListener
    canJQuery: canJQuery
    whenConfirmed: whenConfirmed
    isSupported: isSupported
    popCookie: popCookie
    jQuery: callJQuery
    isIE11: isIE11
