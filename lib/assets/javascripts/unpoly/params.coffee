###*
Params
======

class up.params
###
up.params = (($) ->
  u = up.util

  config = u.config
    nest: true

#  throw "make sure everything nests / unnest properly"
#  throw "honor config.nest"
#  throw "fix red tests"

  reset = config.reset

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
        buildArrayFromQuery(params)
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into an array')
      when 'object'
        buildArrayFromNestedObject(params)

  ###*
  Returns an object representation of the given `params`.

  The object will have a nested structure if `params` has keys like `foo[bar]` or `baz[]`.

  @function up.params.toArray
  ###
  toObject = (params) ->
    switch detectNature(params)
      when 'missing'
        {}
      when 'array'
        buildNestObjectFromArray(params)
      when 'query'
        # We don't want to duplicate the logic to parse a query string.
        buildNestObjectFromArray(toArray(params))
      when 'formData'
        # Until FormData#entries is implemented in all major browsers we must give up here.
        # However, up.form will prefer to serialize forms as arrays, so we should be good
        # in most cases. We only use FormData for forms with file inputs.
        up.fail('Cannot convert FormData into an object')
      when 'object'
        params

  # normalize_params recursively expands parameters into structural types. If
  # the structural types represented by two different parameter names are in
  # conflict, a ParameterTypeError is raised.
  normalizeNestedParamsObject = (params, name, v) ->
    # Parse the name:
    # $1: the next names key without square brackets
    # $2: the rest of the key until the end
    match = /^[\[\]]*([^\[\]]+)\]*(.*?)$/.exec(name)

    k = match?[1]
    after = match?[2]

    console.log("!!! k is %o, v is %o, name is %o", k, v, name)

    if u.isBlank(k)
      if u.isGiven(v) && name == "[]"
        return [v]
      else
        return null

    if after == ''
      params[k] = v
    else if after == "["
      params[name] = v
    else if after == "[]"
      params[k] ||= []
      throw new Error("expected Array (got #{params[k].class.name}) for param `#{k}'") unless u.isArray(params[k])
      params[k].push(v)
#     else if match = /^\[\]\[?([^\[\]]+)\]?$/.exec(after)
    else if match = (/^\[\]\[([^\[\]]+)\]$/.exec(after) || /^\[\](.+)$/.exec(after))
      childKey = match[1]
      params[k] ||= []
      lastObject = u.last(params[k])
      throw new Error("expected Array (got #{params[k].class.name}) for param `#{k}'") unless u.isArray(params[k])
      if u.isObject(lastObject) && !nestedParamsObjectHasKey(lastObject, childKey)
        normalizeNestedParamsObject(lastObject, childKey, v)
      else
        params[k].push normalizeNestedParamsObject({}, childKey, v)
    else
      params[k] ||= {}
      throw new Error("expected Object (got #{params[k]}) for param `#{k}'") unless u.isObject(params[k])
      params[k] = normalizeNestedParamsObject(params[k], after, v)

    params

  nestedParamsObjectHasKey = (hash, key) ->
    console.info("nestedParamsObjectHasKey (%o, %o)", hash, key)
    return false if /\[\]/.test(key)

    keyParts = key.split(/[\[\]]+/)

    console.info("has keyParts %o", keyParts)

    for keyPart in keyParts
      console.info("nestedParamsObjectHasKey with keyPart %o and hash %o", keyPart, hash)
      continue if keyPart == ''
      return false unless u.isObject(hash) && hash.hasOwnProperty(keyPart)
      hash = hash[keyPart]

    console.info("nestedParamsObjectHasKey returns TRUE")

    true

  toQuery = (params, options = {}) ->
    purpose = options.purpose || 'url'
    query = switch detectNature(params)
      when 'missing'
        ''
      when 'query'
        # Remove leading question mark
        params.replace(/^\?/, '')
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
        buildQueryFromNestedObject(params)

    switch purpose
      when 'url'
        query = query.replace(/\+/g, '%20')
      when 'form'
        query = query.replace(/\%20/g, '+')
      else
        up.fail('Unknown purpose %o', purpose)

    query

  arrayEntryToQuery = (entry) ->
    query = encodeURIComponent(entry.name)
    if u.isGiven(entry.value)
      query += "="
      query += encodeURIComponent(entry.value)
    query

  buildQueryFromNestedObject = (value) ->
    array = buildArrayFromNestedObject(value)
    console.info("!!! array is %o", array)
    parts = u.map(array, arrayEntryToQuery)
    parts = u.select(parts, u.isPresent)
    parts.join('&')

  buildArrayFromQuery = (query) ->
    array = []
    for part in query.split('&')
      if u.isPresent(part)
        [name, value] = part.split('=')
        name = decodeURIComponent(name)
        # There are three forms we need to handle:
        # (1) foo=bar should become { name: 'foo', bar: 'bar' }
        # (2) foo=    should become { name: 'foo', bar: '' }
        # (3) foo     should become { name: 'foo', bar: null }
        if u.isGiven(value)
          value = decodeURIComponent(value)
        else
          value = null
        array.push({ name, value })
    array

  buildArrayFromNestedObject = (value, prefix) ->
    if u.isArray(value)
      u.flatMap value, (v) -> buildArrayFromNestedObject(v, "#{prefix}[]")
    else if u.isObject(value)
      entries = []
      for k, v of value
        p = if prefix then "#{prefix}[#{k}]" else k
        entries = entries.concat(buildArrayFromNestedObject(v, p))
      entries
    else if u.isMissing(value)
      [{ name: prefix, value: null }]
    else
      if u.isMissing(prefix)
        throw new Error("value must be a Hash")
      [ { name: prefix, value: value } ]

  buildNestObjectFromArray = (array) ->
      obj = {}
      for entry in array
        normalizeNestedParamsObject(obj, entry.name, entry.value)
      console.info("==== resulting obj is %o", obj)
      obj

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
    absorb(params, { name: field, value: value })

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
        otherArray = toArray(otherParams)
        params = params.concat(otherArray)
      when 'query'
        otherQuery = toQuery(otherParams)
        parts = u.select([params, otherQuery], u.isPresent)
        params = parts.join('&')
      when 'formData'
        otherObject = toObject(otherParams)
        for name, value of otherObject
          params.append(name, value)
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

    add(params, buttonName, buttonValue) if u.isPresent(buttonName)
    params

  up.on 'up:framework:reset', reset

  toArray: toArray
  toObject: toObject
  toQuery: toQuery
  buildURL: buildURL
  add: add
  absorb: absorb
  fromForm: fromForm

)(jQuery)
