u = up.util

class up.Waypoint extends up.Record

  fields: ->
    [
      'name',
      'url',
      'params',
      'data',
      'scrollTops'
      'options'
    ]

  isDisplayed: =>
    $element.length > 0

  elementSelector: =>
    u.attributeSelector('up-waypoint', @name)

  $element: =>
    $(@elementSelector())

  inContext: (options = {}) =>
    copy = undefined

    if u.isPresent(options.params)
      copy ||= @copy(@)
      copy.params = up.params.merge(copy.params, options.params)

    if u.isPresent(options.data)
      copy ||= @copy(@)
      copy.data = u.merge(copy.data, options.data)

    # We try to avoid making a copy of ourselves, so
    # return `copy` only if it is defined.
    copy || this

  restoreURL: =>
    editor = new URLEditor(@url)
    editor.appendParams(@params)
    editor.toURLString()
