u = up.util

class up.URLEditor

  constructor: (url) ->
    [@pathname, @params] = url.split('?')

  appendParams: (newParams) =>
    up.params.absorb(@params, newParams)

  toURLString: =>
    @params.buildURL(@pathname, @params)
