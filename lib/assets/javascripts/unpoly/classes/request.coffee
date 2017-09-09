u = up.util

class up.Request

  constructor: (options) ->
    @method = u.normalizeMethod(options.method)
    @data = options.data
    @target = options.target || 'body'
    @headers = options.headers
    @timeout = options.timeout
    @url = options.url

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

    jqRequest.headers ||= {}
    jqRequest.headers[up.protocol.config.targetHeader] = @target
    jqRequest.headers[up.protocol.config.failTargetHeader] = @failTarget

    if u.contains(up.proxy.config.wrapMethods, jqRequest.method)
      jqRequest.data = u.appendRequestData(jqRequest.data, up.protocol.config.methodParam, jqRequest.method)
      jqRequest.method = 'POST'

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
