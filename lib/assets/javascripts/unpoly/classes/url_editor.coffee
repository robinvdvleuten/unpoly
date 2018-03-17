u = up.util

class up.URLEditor

  constructor: (url) ->
    [@pathname, @params] = url.split('?')

  appendParams: (newParams) =>
    @params = up.params.merge(@params, newParams)

  toURLString: =>
    @params.buildURL(@pathname, @params)
