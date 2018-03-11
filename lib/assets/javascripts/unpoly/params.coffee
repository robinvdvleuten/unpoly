###*
Params
======

class up.params
###
up.params = (($) ->

  u = up.util

  detectNature = (params) ->
    if u.isMissing(params)
      'missing'
    else if u.isArray(params)
      'array'
    else if u.isString(params)
      'query'
    else if u.isFormData(params)
      'formData'
    else if u.isObject(params)
      'object'
    else
      unknownNature(params)

  unknownNature = (obj) ->
    up.fail("Not a supported params nature: %o", obj)

  ###*
  Returns an array representation of the given `params`.

  Each array element will be an object with `{ name }` and `{ key }` properties.

  If `params` is a nested object, the nesting will be flattened and expressed
  in `{ name }` properties instead.

  @function up.params.toArray
  ###
  toArray = (params) ->
    switch detectNature(params)
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
      when 'object'
        for name, value of flattenObject(params)
          { name, value }

  flattenObject = (obj) ->
    obj = {}

    for name, value of params
      if u.isArray(value)
        obj[name + "[]"] = value

    throw "needs to destructure object"


  ###*
  Returns an object representation of the given `params`.

  The object will have a nested structure if `params` has keys like `foo[bar]` or `baz[]`.

  @function up.params.toArray
  ###
  toObject = (params) ->
T   switch detectNature(params)
      when 'missing'
        {}
      when 'array'
        obj = {}

        for entry in params
          # Parse a name like `'foo[bar][baz]'` into an array `['foo', 'bar', 'baz']`
          keySegments = entry.name.match(/[^\[\]]+/g)
          # the last segment needs to set differently depending if the leaf node
          # is an array element (like `foo[]`) or a hash property (like `foo[bar]`)
          lastKeySegment = keySegments.pop()

          # Make sure all parent keys resolve to objects
          node = obj
          for keySegment in keySegments
            node = (node[keySegment] ||= {})

          if isArray = entry.name.test(/\[\]$/)
            # we matched an array like ... fuck
            node[lastKeySegment] ||= []
            node.push(entry.value)
          else
            # we matched a key like [foo]
            node[lastKeySegment] = entry.value

          # NEW

          # Parse a name like `'foo[bar][baz]'` into an array `['foo', 'bar', 'baz']`
          keySegments = []
          keySegments
          while match = /([^\[\]])/g.exec(entry.name)
            keySegments.push(match[1])

          # Make sure all parent keys resolve to objects
          node = obj
          for keySegment in keySegments
            if keySegment.length
              # hash
            else
              # array
              node = (node[keySegment] ||= {})

          # the last segment needs to set differently depending if the leaf node
          # is an array element (like `foo[]`) or a hash property (like `foo[bar]`)
          lastKeySegment = keySegments.pop()

          # Make sure all parent keys resolve to objects
          node = obj
          for keySegment in keySegments
            node = (node[keySegment] ||= {})

          if isArray = entry.name.test(/\[\]$/)
            # we matched an array like ... fuck
            node[lastKeySegment] ||= []
            node.push(entry.value)
          else
            # we matched a key like [foo]
            node[lastKeySegment] = entry.value

        obj
      when 'query'
        # We don't want to duplicate the logic to parse a query string.
        toObject(toArray(params))
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into an object')
      when 'object'
        params

  toQuery = (params, options) ->
    purpose = options.purpose || 'url'
    query = switch detectNature(params)
      when 'missing'
        ''
      when 'query'
        params
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into a query string')
      when 'array'
        parts = for entry in params
          encodeURIComponent(entry.name) + '=' + encodeURIComponent(entry.value)
        parts.join('&')
      when 'object'
        convertToQuery(convertToArray(params))

    switch purpose
      when 'url'
        query = query.replace(/\+/g, '%20')
      when 'form'
        query = query.replace(/\%20/g, '+')
      else
        up.fail('Unknown purpose %o', purpose)
    query

  buildURL = (base, params) ->
    parts = [base, toQuery(params)]
    parts = u.select(parts, u.isPresent)
    separator = if u.contains(base, '?') then '&' else '?'
    parts.join(separator)

  ###*
  Adds a new entry with the given `name` and `value` to the given `params`.
  Modifies `params`.

  @function up.params.add
  ###
  add = (params, name, value) ->
    field = {}
    field[name] = value
    absorb(field)

  ###*
  Merges the request params from `otherParams` into `params`.
  Modifies `params`.

  @function up.params.absorb
  ###
  absorb = (params, otherParams) ->
    switch detectNature(params)
      when 'missing'
        params = {}
        absorb(otherParams)
      when 'array'
        otherArray = convertToArray(otherParams)
        params = params.concat(otherArray)
      when 'query'
        otherQuery = convertToQuery(otherParams)
        parts = u.select([params, otherQuery], u.isPresent)
        params = parts.join('&')
      when 'formData'
        otherObject = convertToObject(otherParams)
        for name, value of otherObject
          params.append(name, value)
      when 'params'
        absorb(otherParams.params)
      when 'object'
        u.assign(params, otherParams)

  $submittingButton = ($form) ->
    submitButtonSelector = 'input[type=submit], button[type=submit], button:not([type])'
    $activeElement = $(document.activeElement)
    if $activeElement.is(submitButtonSelector) && $form.has($activeElement)
      $activeElement
    else
      $form.find(submitButtonSelector).first()

  fromForm = (form) ->
    options = u.options(options)
    $form = $(form)
    hasFileInputs = $form.find('input[type=file]').length

    $button = $submittingButton($form)
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

    add(params, buttonName, buttonValue) if isPresent(buttonName)
    params

  toArray: toArray
  toObject: toObject
  toQuery: toQuery
  toURL: toURL
  add: add
  absorb: absorb
  fromForm: fromForm

)(jQuery)
