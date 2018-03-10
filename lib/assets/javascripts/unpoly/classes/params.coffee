u = up.util

class up.Params

  constructor: (params) ->
    @params = params

  mutateNature: (newNature, options) =>
    switch newNature
      when 'array'
        @params = @convertToArray(@params, options)
      when 'query'
        @params = @convertToQuery(@params, options)
      when 'object'
        @params = @convertToObject(@params, options)
      else
        up.fail('Cannot convert %o to %s', @params, newNature)

  ###*
  Merges the request params from `otherParams` into this object.
  Modified this object.

  @function up.Params.prototype.absorb
  ###
  absorb: (otherParams) =>
    switch @detectNature(@params)
      when 'missing'
        @params = {}
        @absorb(otherParams)
      when 'array'
        otherArray = @convertToArray(otherParams)
        @params = @params.concat(otherArray)
      when 'query'
        otherQuery = @convertToQuery(otherParams)
        parts = u.select([@params, otherQuery], u.isPresent)
        @params = parts.join('&')
      when 'formData'
        otherObject = @convertToObject(otherParams)
        for name, value of otherObject
          @params.append(name, value)
      when 'params'
        @absorb(otherParams.params)
      when 'object'
        u.assign(@params, otherParams)

  append: (key, value) =>
    field = {}
    field[key] = value
    absorb(field)

  convertToArray: (params) =>
    switch @detectNature(params)
      when 'missing'
        []
      when 'array'
        params
      when 'query'
        array = []
        for part in params.split('&')
          if isPresent(part)
            pair = part.split('=')
            array.push
              name: decodeURIComponent(pair[0])
              value: decodeURIComponent(pair[1])
        array
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into an array')
      when 'params'
        @convertToArray(params.params)
      when 'object'
        { name, value } for name, value of params

  convertToObject: (params) =>
    switch @detectNature(params)
      when 'missing'
        {}
      when 'array'
        obj = {}
        for entry in params
          obj[entry.name] = entry.value
        obj
      when 'query'
        # We don't want to duplicate the logic to parse a query string.
        @convertToObject(@convertToArray(params))
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into an object')
      when 'params'
        @convertToObject(params.params)
      when 'object'
        params

  convertToQuery: (params, options) =>
    purpose = options.purpose || 'url'
    query = switch @detectNature(params)
      when 'missing'
        ''
      when 'query'
        params
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into a query string')
      when 'params'
        @convertToQuery(params.params)
      when 'array'
        parts = for entry in params
          encodeURIComponent(entry.name) + '=' + encodeURIComponent(entry.value)
        parts.join('&')
      when 'object'
        @convertToQuery(@convertToArray(params))

    switch purpose
      when 'url'
        query = query.replace(/\+/g, '%20')
      when 'form'
        query = query.replace(/\%20/g, '+')
      else
        up.fail('Unknown purpose %o', purpose)
    query

  detectNature: (params) =>
    if u.isMissing(params)
      'missing'
    else if u.isArray(params)
      'array'
    else if u.isString(params)
      'query'
    else if u.isFormData(params)
      'formData'
    else if params instanceof up.Params
      'params'
    else if u.isObject(params)
      'object'
    else
      @unknownNature(params)

  unknownNature: (obj) ->
    up.fail("Not a supported params nature: %o", obj)

  value: (options = {}) =>
    if options.nature
      @mutateNature(options.nature, options)
    @params

  asObject: =>
    @value(nature: 'object')

  asArray: =>
    @value(nature: 'array')

  asQuery: =>
    @value(nature: 'query')

  asURL: (pathname) =>
    parts = [pathname, @asQuery()]
    parts = u.select(parts, u.isPresent)
    separator = if u.contains(pathname, '?') then '&' else '?'
    parts.join(separator)

  @$submittingButton = ($form) ->
    submitButtonSelector = 'input[type=submit], button[type=submit], button:not([type])'
    $activeElement = $(document.activeElement)
    if $activeElement.is(submitButtonSelector) && $form.has($activeElement)
      $activeElement
    else
      $form.find(submitButtonSelector).first()

  @fromForm: (form) ->
    options = u.options(options)
    $form = $(form)
    hasFileInputs = $form.find('input[type=file]').length

    $button = @$submittingButton($form)
    buttonName = $button.attr('name')
    buttonValue = $button.val()

    # We try to stick with an array representation, whose contents we can inspect.
    # We cannot inspect FormData on IE11 because it has no support for `FormData.entries`.
    # Inspection is needed to generate a cache key (see `up.proxy`) and to make
    # vanilla requests when `pushState` is unavailable (see `up.browser.navigate`).
    params = undefined
    if !hasFileInputs || options.nature == 'array'
      params = $form.serializeArray()
    else
      params = new FormData($form.get(0))

    params = new @(params)
    params.append(params, buttonName, buttonValue) if isPresent(buttonName)
    params

  @wrap: (object) ->
    if object instanceof @
      object
    else
      new @(object)
