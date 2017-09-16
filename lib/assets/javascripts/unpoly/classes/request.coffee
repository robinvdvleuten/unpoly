#= require ./record

u = up.util

class up.Request extends up.Record

  fields: ->
    ['method', 'url', 'data', 'target', 'failTarget', 'headers', 'timeout']

  constructor: (options) ->
    super(options)
    @method = u.normalizeMethod(options.method)
    @headers ||= {}
    @extractHashFromUrl()
    if @data && !u.methodAllowsPayload(@method)
      @transferDataToUrl()

  extractHashFromUrl: =>
    urlParts = u.parseUrl(@url)
    # Remember the #hash for later revealing.
    # It will be lost during normalization.
    @hash = urlParts.hash
    @url = u.normalizeUrl(urlParts, hash: false)

  transferDataToUrl: =>
    # GET methods are not allowed to have a payload, so we transfer { data } params to the URL.
    query = u.requestDataAsQuery(@data)
    separator = if u.contains(@url, '?') then '&' else '?'
    @url += separator + query
    # Now that we have transfered the params into the URL,
    # we delete them from the { data } option.
    @data = undefined

  isIdempotent: =>
    up.proxy.isIdempotentMethod(@method)

  submitWithJQuery: =>
    # We will modify the request below for features like method wrapping.
    # Let's not change the original request which would confuse API clients
    # and cache key logic.
    jqRequest = u.copy(@)
    jqRequest.data = u.copy(@data) unless u.isFormData(@data)

    jqRequest.headers[up.protocol.config.targetHeader] = @target if @target
    jqRequest.headers[up.protocol.config.failTargetHeader] = @failTarget if @failTarget

    if u.contains(up.proxy.config.wrapMethods, jqRequest.method)

      console.error('request.data before is %o', u.copy(jqRequest.data))

      jqRequest.data = u.appendRequestData(jqRequest.data, up.protocol.config.methodParam, jqRequest.method)
      jqRequest.method = 'POST'

      console.error('request.data is now %o', u.copy(jqRequest.data))

    if u.isFormData(jqRequest.data)
      # Disable jQuery's request data processing so we can pass
      # a FormData object (http://stackoverflow.com/a/5976031)
      jqRequest.contentType = false
      jqRequest.processData = false

    $.ajax(jqRequest)

  @normalize: (object) ->
    if object instanceof @
      # This object has gone through instantiation and normalization before.
      object
    else
      new @(object)
